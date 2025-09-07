export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-heading text-xl font-semibold mb-2">Panel</h2>
        <p className="font-body text-muted-foreground">Gestión de productos, stock y media.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-heading font-medium mb-1">Productos</h3>
          <p className="font-body text-sm text-muted-foreground">Crear, editar, eliminar.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-heading font-medium mb-1">Stock por talle</h3>
          <p className="font-body text-sm text-muted-foreground">Actualizar disponibilidad por talle.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-heading font-medium mb-1">Media</h3>
          <p className="font-body text-sm text-muted-foreground">Subir imágenes y videos.</p>
        </div>
      </div>
    </div>
  )
}
