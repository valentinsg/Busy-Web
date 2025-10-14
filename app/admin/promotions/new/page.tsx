"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { PromoType } from "@/lib/types"

export default function NewPromotionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
    promo_type: "nxm" as PromoType,
    eligible_skus: "",
    sku_match_type: "prefix" as "exact" | "prefix",
    priority: 10,
    min_quantity: "",
    max_uses_per_customer: "",
    max_total_uses: "",
    starts_at: "",
    ends_at: "",
    // Config fields
    buy: "",
    pay: "",
    discount_percent: "",
    discount_amount: "",
    nth_unit: "",
    required_skus: "",
    sku_groups: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Construir config según el tipo
      let config: any = {}
      
      switch (form.promo_type) {
        case 'nxm':
          config = {
            buy: parseInt(form.buy),
            pay: parseInt(form.pay),
          }
          break
        case 'percentage_off':
          config = {
            discount_percent: parseFloat(form.discount_percent),
          }
          break
        case 'fixed_amount':
          config = {
            discount_amount: parseFloat(form.discount_amount),
          }
          break
        case 'combo':
          config = {
            required_skus: form.required_skus.split(',').map(s => s.trim()),
            discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : undefined,
            discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : undefined,
            match_type: form.sku_match_type,
          }
          break
        case 'bundle':
          config = {
            sku_groups: form.sku_groups.split('|').map(group => 
              group.split(',').map(s => s.trim())
            ),
            discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : undefined,
            discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : undefined,
          }
          break
        case 'nth_unit_discount':
          config = {
            nth_unit: parseInt(form.nth_unit),
            discount_percent: parseFloat(form.discount_percent),
          }
          break
      }

      const payload = {
        name: form.name,
        description: form.description || undefined,
        active: form.active,
        promo_type: form.promo_type,
        config,
        eligible_skus: form.eligible_skus.split(',').map(s => s.trim()),
        sku_match_type: form.sku_match_type,
        priority: form.priority,
        min_quantity: form.min_quantity ? parseInt(form.min_quantity) : undefined,
        max_uses_per_customer: form.max_uses_per_customer ? parseInt(form.max_uses_per_customer) : undefined,
        max_total_uses: form.max_total_uses ? parseInt(form.max_total_uses) : undefined,
        starts_at: form.starts_at || undefined,
        ends_at: form.ends_at || undefined,
      }

      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Promoción creada correctamente",
        })
        router.push('/admin/promotions')
      } else {
        throw new Error('Failed to create promotion')
      }
    } catch (error) {
      console.error('Error creating promotion:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la promoción",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/promotions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-heading font-bold">Nueva Promoción</h1>
        <p className="text-muted-foreground mt-1">
          Crea una nueva promoción personalizada
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Promoción *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: 2x1 en Remeras Básicas"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción detallada de la promoción"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                />
                <Label htmlFor="active">Promoción activa</Label>
              </div>

              <div>
                <Label htmlFor="priority">Prioridad (mayor = más prioridad)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Las promociones con mayor prioridad se aplican primero
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Promoción */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Tipo de Promoción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="promo_type">Tipo *</Label>
                <select
                  id="promo_type"
                  value={form.promo_type}
                  onChange={(e) => setForm({ ...form, promo_type: e.target.value as PromoType })}
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  required
                >
                  <option value="nxm" className="bg-background text-foreground">NxM (2x1, 3x2, etc.)</option>
                  <option value="percentage_off" className="bg-background text-foreground">Porcentaje de Descuento</option>
                  <option value="fixed_amount" className="bg-background text-foreground">Monto Fijo de Descuento</option>
                  <option value="combo" className="bg-background text-foreground">Combo (SKUs específicos)</option>
                  <option value="bundle" className="bg-background text-foreground">Bundle (Grupos de SKUs)</option>
                  <option value="nth_unit_discount" className="bg-background text-foreground">N° Unidad con Descuento</option>
                </select>
              </div>

              {/* Config según tipo */}
              {form.promo_type === 'nxm' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buy">Cantidad a Comprar *</Label>
                    <Input
                      id="buy"
                      type="number"
                      value={form.buy}
                      onChange={(e) => setForm({ ...form, buy: e.target.value })}
                      placeholder="2"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pay">Cantidad a Pagar *</Label>
                    <Input
                      id="pay"
                      type="number"
                      value={form.pay}
                      onChange={(e) => setForm({ ...form, pay: e.target.value })}
                      placeholder="1"
                      required
                      min="1"
                    />
                  </div>
                  <p className="col-span-2 text-xs text-muted-foreground">
                    Ejemplo: 2x1 = Compra 2, Paga 1
                  </p>
                </div>
              )}

              {form.promo_type === 'percentage_off' && (
                <div>
                  <Label htmlFor="discount_percent">Porcentaje de Descuento (%) *</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                    placeholder="20"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              )}

              {form.promo_type === 'fixed_amount' && (
                <div>
                  <Label htmlFor="discount_amount">Monto de Descuento ($) *</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    value={form.discount_amount}
                    onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                    placeholder="5000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {form.promo_type === 'combo' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="required_skus">SKUs Requeridos (separados por coma) *</Label>
                    <Input
                      id="required_skus"
                      value={form.required_skus}
                      onChange={(e) => setForm({ ...form, required_skus: e.target.value })}
                      placeholder="BUSY-TEE, BUSY-PANT"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      El cliente debe tener al menos 1 de cada SKU
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_percent_combo">% Descuento</Label>
                      <Input
                        id="discount_percent_combo"
                        type="number"
                        value={form.discount_percent}
                        onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                        placeholder="20"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_amount_combo">$ Descuento</Label>
                      <Input
                        id="discount_amount_combo"
                        type="number"
                        value={form.discount_amount}
                        onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                        placeholder="5000"
                        min="0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Especifica % o $ (no ambos)
                  </p>
                </div>
              )}

              {form.promo_type === 'bundle' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sku_groups">Grupos de SKUs (separados por |) *</Label>
                    <Textarea
                      id="sku_groups"
                      value={form.sku_groups}
                      onChange={(e) => setForm({ ...form, sku_groups: e.target.value })}
                      placeholder="BUSY-TEE001,BUSY-TEE002|BUSY-PANT001,BUSY-PANT002"
                      required
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Cada grupo separado por |, SKUs dentro del grupo separados por coma
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_percent_bundle">% Descuento</Label>
                      <Input
                        id="discount_percent_bundle"
                        type="number"
                        value={form.discount_percent}
                        onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                        placeholder="20"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_amount_bundle">$ Descuento</Label>
                      <Input
                        id="discount_amount_bundle"
                        type="number"
                        value={form.discount_amount}
                        onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                        placeholder="5000"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.promo_type === 'nth_unit_discount' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nth_unit">N° de Unidad *</Label>
                    <Input
                      id="nth_unit"
                      type="number"
                      value={form.nth_unit}
                      onChange={(e) => setForm({ ...form, nth_unit: e.target.value })}
                      placeholder="2"
                      required
                      min="2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ej: 2 = 2da unidad con descuento
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="discount_percent_nth">% Descuento *</Label>
                    <Input
                      id="discount_percent_nth"
                      type="number"
                      value={form.discount_percent}
                      onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                      placeholder="50"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos Elegibles */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Productos Elegibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eligible_skus">SKUs Elegibles (separados por coma) *</Label>
                <Textarea
                  id="eligible_skus"
                  value={form.eligible_skus}
                  onChange={(e) => setForm({ ...form, eligible_skus: e.target.value })}
                  placeholder="BUSY-BASIC, BUSY-TEE"
                  required
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes usar prefijos (BUSY-BASIC) o SKUs exactos (BUSY-BASIC001)
                </p>
              </div>

              <div>
                <Label htmlFor="sku_match_type">Tipo de Match</Label>
                <select
                  id="sku_match_type"
                  value={form.sku_match_type}
                  onChange={(e) => setForm({ ...form, sku_match_type: e.target.value as "exact" | "prefix" })}
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                >
                  <option value="prefix" className="bg-background text-foreground">Por Prefijo (recomendado)</option>
                  <option value="exact" className="bg-background text-foreground">Exacto</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Prefijo: BUSY-BASIC coincide con BUSY-BASIC001, BUSY-BASIC002, etc.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Restricciones */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Restricciones (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="min_quantity">Cantidad Mínima de Productos</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={form.min_quantity}
                  onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                  placeholder="2"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_uses_per_customer">Usos por Cliente</Label>
                  <Input
                    id="max_uses_per_customer"
                    type="number"
                    value={form.max_uses_per_customer}
                    onChange={(e) => setForm({ ...form, max_uses_per_customer: e.target.value })}
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="max_total_uses">Usos Totales</Label>
                  <Input
                    id="max_total_uses"
                    type="number"
                    value={form.max_total_uses}
                    onChange={(e) => setForm({ ...form, max_total_uses: e.target.value })}
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starts_at">Fecha de Inicio</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">Fecha de Fin</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Promoción"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/promotions">Cancelar</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
