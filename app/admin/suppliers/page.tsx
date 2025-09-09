'use client'

import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function SuppliersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<
    Array<{
      id: string
      name: string
      contact_name?: string | null
      contact_email?: string | null
      contact_phone?: string | null
      notes?: string | null
    }>
  >([])

  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')

  // simple validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[+()\-\s\d]{7,20}$/
  const MAX_NOTES = 500

  const createErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nombre requerido'
    if (contactEmail && !emailRegex.test(contactEmail))
      errs.contactEmail = 'Email inválido'
    if (contactPhone && !phoneRegex.test(contactPhone))
      errs.contactPhone = 'Teléfono inválido'
    if (notes && notes.length > MAX_NOTES)
      errs.notes = `Máximo ${MAX_NOTES} caracteres`
    return errs
  }, [name, contactEmail, contactPhone, notes])

  // inline edit state
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    name: string
    contact_name: string
    contact_email: string
    contact_phone: string
    notes?: string
  }>({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  })

  const editErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (editId) {
      if (!editData.name.trim()) errs.name = 'Nombre requerido'
      if (editData.contact_email && !emailRegex.test(editData.contact_email))
        errs.contact_email = 'Email inválido'
      if (editData.contact_phone && !phoneRegex.test(editData.contact_phone))
        errs.contact_phone = 'Teléfono inválido'
      if ((editData.notes || '').length > MAX_NOTES)
        errs.notes = `Máximo ${MAX_NOTES} caracteres`
    }
    return errs
  }, [editId, editData])

  const load = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/suppliers')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Error')
        setSuppliers(json.data || [])
      } catch (e: any) {
        toast({
          title: 'Error al cargar proveedores',
          description: e?.message || '',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  const startEdit = (s: any) => {
    setEditId(s.id)
    setEditData({
      name: s.name || '',
      contact_name: s.contact_name || '',
      contact_email: s.contact_email || '',
      contact_phone: s.contact_phone || '',
      notes: s.notes || '',
    })
  }

  const cancelEdit = () => {
    setEditId(null)
  }

  const saveEdit = async () => {
    if (!editId) return
    if (Object.keys(editErrors).length > 0) return
    try {
      setLoading(true)
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...editData }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({
        title: 'Proveedor actualizado',
        description: json?.supplier?.name,
      })
      setEditId(null)
      await load()
    } catch (e: any) {
      toast({
        title: 'Error al actualizar',
        description: e?.message || '',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/admin/suppliers?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({ title: 'Proveedor eliminado' })
      await load()
    } catch (e: any) {
      toast({
        title: 'Error al eliminar',
        description: e?.message || '',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    try {
      if (!name.trim()) {
        toast({ title: 'Nombre requerido', variant: 'destructive' })
        return
      }
      setLoading(true)
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact_name: contactName || undefined,
          contact_email: contactEmail || undefined,
          contact_phone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({ title: 'Proveedor creado', description: json?.supplier?.name })
      // reset and reload
      setName('')
      setContactName('')
      setContactEmail('')
      setContactPhone('')
      setNotes('')
      await load()
    } catch (e: any) {
      toast({
        title: 'Error al crear proveedor',
        description: e?.message || '',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Lista y creación de proveedores.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          Volver al panel
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded border p-4 md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Lista</div>
            <button
              onClick={load}
              disabled={loading}
              className="rounded bg-muted px-3 py-1 text-sm"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2">Nombre</th>
                  <th className="text-left px-3 py-2">Contacto</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Teléfono</th>
                  <th className="text-left px-3 py-2">Notas</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      {loading ? 'Cargando...' : 'Sin datos'}
                    </td>
                  </tr>
                )}
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, name: e.target.value }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.name
                      )}
                      {editId === s.id && editErrors.name && (
                        <div className="text-[11px] text-red-500 mt-1">
                          {editErrors.name}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          value={editData.contact_name}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              contact_name: e.target.value,
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.contact_name || '-'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          type="email"
                          value={editData.contact_email}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              contact_email: e.target.value,
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.contact_email || '-'
                      )}
                      {editId === s.id && editErrors.contact_email && (
                        <div className="text-[11px] text-red-500 mt-1">
                          {editErrors.contact_email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          value={editData.contact_phone}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              contact_phone: e.target.value,
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.contact_phone || '-'
                      )}
                      {editId === s.id && editErrors.contact_phone && (
                        <div className="text-[11px] text-red-500 mt-1">
                          {editErrors.contact_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              notes: e.target.value,
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background min-h-[48px]"
                        />
                      ) : (
                        <span title={s.notes || undefined}>
                          {s.notes
                            ? s.notes.length > 60
                              ? s.notes.slice(0, 60) + '…'
                              : s.notes
                            : '-'}
                        </span>
                      )}
                      {editId === s.id && editErrors.notes && (
                        <div className="text-[11px] text-red-500 mt-1">
                          {editErrors.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {editId === s.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={saveEdit}
                            disabled={
                              loading || Object.keys(editErrors).length > 0
                            }
                            className="text-sm text-primary hover:underline disabled:opacity-60"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-sm text-muted-foreground hover:underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => startEdit(s)}
                            className="text-sm text-primary hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => remove(s.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border p-4 space-y-3">
          <div className="font-medium">Nuevo proveedor</div>
          <div>
            <label className="text-xs text-muted-foreground">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-background"
            />
            {createErrors.name && (
              <div className="text-[11px] text-red-500 mt-1">
                {createErrors.name}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Contacto</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-background"
              />
              {createErrors.contactEmail && (
                <div className="text-[11px] text-red-500 mt-1">
                  {createErrors.contactEmail}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Teléfono</label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-background"
            />
            {createErrors.contactPhone && (
              <div className="text-[11px] text-red-500 mt-1">
                {createErrors.contactPhone}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-background min-h-[80px]"
            />
            {createErrors.notes && (
              <div className="text-[11px] text-red-500 mt-1">
                {createErrors.notes}
              </div>
            )}
          </div>
          <button
            onClick={create}
            disabled={loading || Object.keys(createErrors).length > 0}
            className="w-full rounded bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear proveedor'}
          </button>
        </div>
      </div>
    </div>
  )
}
