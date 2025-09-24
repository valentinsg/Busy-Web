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
      category?: string | null
      product_tags?: string[]
      reference_price?: string | null
      minimum_order_quantity?: number | null
      delivery_time_days?: number | null
      payment_terms?: string | null
      tags?: string[]
      status?: 'active' | 'inactive'
      reliability_rating?: number | null
    }>
  >([])

  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  // new fields for create form
  const [category, setCategory] = useState('')
  const [productTags, setProductTags] = useState('')
  const [referencePrice, setReferencePrice] = useState('')
  const [minOrderQty, setMinOrderQty] = useState<number | ''>('')
  const [deliveryDays, setDeliveryDays] = useState<number | ''>('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [rating, setRating] = useState<number | ''>('')

  // filters & search
  const [fCategory, setFCategory] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fRating, setFRating] = useState('')
  const [q, setQ] = useState('')

  // create modal
  const [createOpen, setCreateOpen] = useState(false)

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
    category?: string
    minimum_order_quantity?: number | ''
    delivery_time_days?: number | ''
    status?: 'active' | 'inactive'
    reliability_rating?: number | ''
  }>({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    category: '',
    minimum_order_quantity: '',
    delivery_time_days: '',
    status: 'active',
    reliability_rating: '',
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

  const filtered = useMemo(() => {
    let list = suppliers
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter((s) =>
        (s.name || '').toLowerCase().includes(t) ||
        (s.contact_name || '').toLowerCase().includes(t)
      )
    }
    if (fCategory) list = list.filter((s) => (s.category || '') === fCategory)
    if (fStatus) list = list.filter((s) => (s.status || '') === fStatus)
    if (fRating) list = list.filter((s) => String(s.reliability_rating || '') === fRating)
    return list
  }, [suppliers, q, fCategory, fStatus, fRating])

  const exportCSV = () => {
    const headers = [
      'Nombre','Contacto','Email','Teléfono','Notas','Categoría','Pedido mínimo','Plazo (días)','Estado','Ranking'
    ]
    const rows = filtered.map((s) => [
      s.name || '', s.contact_name || '', s.contact_email || '', s.contact_phone || '', (s.notes || '').replaceAll('\n',' '),
      s.category || '', s.minimum_order_quantity ?? '', s.delivery_time_days ?? '', s.status || '', s.reliability_rating ?? ''
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proveedores.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // quick purchase modal state
  const [qpOpen, setQpOpen] = useState<{ supplier?: { id: string; name: string } } | null>(null)
  const [qpAmount, setQpAmount] = useState<number | ''>('')
  const [qpCurrency, setQpCurrency] = useState('USD')
  const [qpDate, setQpDate] = useState<string>(() => new Date().toISOString().slice(0,16))
  const [qpLoading, setQpLoading] = useState(false)

  const submitQuickPurchase = async () => {
    if (!qpOpen?.supplier?.id || !qpAmount) return
    try {
      setQpLoading(true)
      const res = await fetch('/api/admin/expenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'supplier_purchase',
          amount: Number(qpAmount),
          currency: qpCurrency,
          supplier_id: qpOpen.supplier.id,
          description: `Compra rápida - ${qpOpen.supplier.name}`,
          incurred_at: qpDate ? new Date(qpDate).toISOString() : undefined,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({ title: 'Compra rápida registrada', description: json?.expense?.id })
      setQpOpen(null)
    } catch (e:any) {
      toast({ title: 'Error registrando compra', description: e?.message || '', variant: 'destructive' })
    } finally {
      setQpLoading(false)
    }
  }

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
      category: s.category || '',
      minimum_order_quantity: typeof s.minimum_order_quantity === 'number' ? s.minimum_order_quantity : '',
      delivery_time_days: typeof s.delivery_time_days === 'number' ? s.delivery_time_days : '',
      status: (s.status === 'inactive' ? 'inactive' : 'active'),
      reliability_rating: typeof s.reliability_rating === 'number' ? s.reliability_rating : '',
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
      // normalize numeric fields and empty strings
      const payload: any = {
        id: editId,
        name: editData.name,
        contact_name: editData.contact_name,
        contact_email: editData.contact_email,
        contact_phone: editData.contact_phone,
        notes: editData.notes,
        category: editData.category,
        minimum_order_quantity:
          editData.minimum_order_quantity === ''
            ? null
            : Number(editData.minimum_order_quantity),
        delivery_time_days:
          editData.delivery_time_days === ''
            ? null
            : Number(editData.delivery_time_days),
        status: editData.status,
        reliability_rating:
          editData.reliability_rating === ''
            ? null
            : Number(editData.reliability_rating),
      }
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
          category: category || undefined,
          product_tags: productTags ? productTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
          reference_price: referencePrice || undefined,
          minimum_order_quantity: minOrderQty === '' ? undefined : Number(minOrderQty),
          delivery_time_days: deliveryDays === '' ? undefined : Number(deliveryDays),
          payment_terms: paymentTerms || undefined,
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
          status,
          reliability_rating: rating === '' ? undefined : Number(rating),
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
      setCategory('')
      setProductTags('')
      setReferencePrice('')
      setMinOrderQty('')
      setDeliveryDays('')
      setPaymentTerms('')
      setTags('')
      setStatus('active')
      setRating('')
      setCreateOpen(false)
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

        <div className="grid md:grid-cols-1 gap-4">
        <div className="rounded border p-4 md:col-span-1 space-y-2 bg-card/20">
          <div className="flex items-center justify-between">
            <div className="font-medium">Lista</div>
            <div className="flex gap-2">
              <button onClick={()=>setCreateOpen(true)} className="rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm">Nuevo proveedor</button>
              <button onClick={exportCSV} className="rounded bg-muted px-3 py-1.5 text-sm">Exportar CSV</button>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nombre o contacto" className="border rounded px-2 py-1 bg-background" />
            <input value={fCategory} onChange={(e)=>setFCategory(e.target.value)} placeholder="Filtrar por categoría" className="border rounded px-2 py-1 bg-background" />
            <select value={fStatus} onChange={(e)=>setFStatus(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Estado (todos)</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <select value={fRating} onChange={(e)=>setFRating(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Ranking (todos)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded border shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2">Nombre</th>
                  <th className="text-left px-3 py-2">Contacto</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Teléfono</th>
                  <th className="text-left px-3 py-2">Categoría</th>
                  <th className="text-left px-3 py-2">Pedido mínimo</th>
                  <th className="text-left px-3 py-2">Plazo (días)</th>
                  <th className="text-left px-3 py-2">Estado</th>
                  <th className="text-left px-3 py-2">Ranking</th>
                  <th className="text-left px-3 py-2">Notas</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-muted-foreground"
                      colSpan={11}
                    >
                      {loading ? 'Cargando...' : 'Sin datos'}
                    </td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t align-top hover:bg-muted/30">
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
                        <input
                          value={editData.category || ''}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, category: e.target.value }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.category || '-'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editData.minimum_order_quantity}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              minimum_order_quantity:
                                e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.minimum_order_quantity ?? '-'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editData.delivery_time_days}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              delivery_time_days:
                                e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        />
                      ) : (
                        s.delivery_time_days ?? '-'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <select
                          value={editData.status}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, status: e.target.value as any }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      ) : (
                        s.status === 'inactive' ? 'Inactivo' : 'Activo'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editId === s.id ? (
                        <select
                          value={editData.reliability_rating}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              reliability_rating:
                                e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-full border rounded px-2 py-1 bg-background"
                        >
                          <option value="">Sin especificar</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      ) : (
                        s.reliability_rating ? '★'.repeat(s.reliability_rating) : '-'
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
                            onClick={() => setQpOpen({ supplier: { id: s.id, name: s.name } })}
                            className="text-sm text-foreground/90 hover:underline"
                          >
                            Añadir compra rápida
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
        </div>
      {qpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Compra rápida - {qpOpen.supplier?.name}</div>
              <button onClick={()=>setQpOpen(null)} className="text-sm text-muted-foreground hover:underline">Cerrar</button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monto</label>
              <input type="number" step="0.01" value={qpAmount} onChange={(e)=>setQpAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Moneda</label>
                <input value={qpCurrency} onChange={(e)=>setQpCurrency(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fecha</label>
                <input type="datetime-local" value={qpDate} onChange={(e)=>setQpDate(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
            </div>
            <button onClick={submitQuickPurchase} disabled={qpLoading || !qpAmount} className="w-full rounded bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-60">
              {qpLoading ? 'Guardando...' : 'Registrar compra'}
            </button>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded border bg-background p-4 space-y-3 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <div className="font-medium">Nuevo proveedor</div>
              <button onClick={()=>setCreateOpen(false)} className="text-sm text-muted-foreground hover:underline">Cerrar</button>
            </div>
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
            <div className="grid md:grid-cols-2 gap-2">
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
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Categoría / rubro</label>
                <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Precio de referencia</label>
                <input value={referencePrice} onChange={(e)=>setReferencePrice(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Pedido mínimo</label>
                <input type="number" min={0} value={minOrderQty} onChange={(e)=>setMinOrderQty(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Plazo de entrega (días)</label>
                <input type="number" min={0} value={deliveryDays} onChange={(e)=>setDeliveryDays(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Condiciones de pago</label>
                <input value={paymentTerms} onChange={(e)=>setPaymentTerms(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Estado</label>
                <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="w-full border rounded px-2 py-1 bg-background">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Tags de productos (coma)</label>
                <input value={productTags} onChange={(e)=>setProductTags(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Etiquetas (coma)</label>
                <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ranking de confiabilidad (1-5)</label>
              <select value={rating} onChange={(e)=>setRating(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background">
                <option value="">Sin especificar</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
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
      )}
    </div>
  )
}
