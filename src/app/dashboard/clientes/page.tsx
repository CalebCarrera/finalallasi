"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  Edit,
  Users,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"

const initialClients = Array.from({ length: 53 }, (_, i) => ({
  id: i + 1,
  name: `Cliente ${i + 1}`,
  email: `cliente${i + 1}@mail.com`,
  active: Math.random() > 0.3, // 70% activos, 30% inactivos
}))

type SortField = "id" | "name" | "email" | "active"
type SortDirection = "asc" | "desc"

export default function ClientesPage() {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean; id?: number }>({ open: false })
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editActive, setEditActive] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number; name?: string }>({ open: false })

  const pageSize = 10

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setPage(1) // Resetear a la primera página al ordenar
  }

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  // Filtrar y ordenar clientes
  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const sorted = [...filtered].sort((a, b) => {
    let aValue = a[sortField as keyof typeof a];
    let bValue = b[sortField as keyof typeof b];
  
    // Si ambos son strings, convertir a minúsculas
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
  
    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const openEditModal = (id: number) => {
    const client = clients.find((c) => c.id === id)
    if (client) {
      setEditName(client.name)
      setEditEmail(client.email)
      setEditActive(client.active)
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = () => {
    setClients(
      clients.map((c) => (c.id === editModal.id ? { ...c, name: editName, email: editEmail, active: editActive } : c)),
    )
    setEditModal({ open: false })
  }

  const handleDelete = (id: number) => {
    setClients(clients.filter((c) => c.id !== id))
    setDeleteModal({ open: false })
  }

  const openDeleteModal = (id: number) => {
    const client = clients.find((c) => c.id === id)
    if (client) {
      setDeleteModal({ open: true, id, name: client.name })
    }
  }

  const toggleClientStatus = (id: number) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes de manera eficiente</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Users className="w-4 h-4 mr-1" />
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar cliente</DialogTitle>
                  <DialogDescription>(Simulación, no agrega realmente)</DialogDescription>
                </DialogHeader>
                <Button onClick={() => setShowAdd(false)} className="w-full mt-4">
                  Cerrar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    className="w-20 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Nombre
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("active")}
                  >
                    <div className="flex items-center">
                      Estado
                      {getSortIcon("active")}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{c.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={c.active ? "default" : "secondary"}
                        className={
                          c.active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-600 hover:bg-gray-100"
                        }
                      >
                        {c.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(c.id)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleClientStatus(c.id)} className="cursor-pointer">
                            {c.active ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(c.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 text-destructive h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="w-8 h-8" />
                        <p className="text-sm">No se encontraron clientes</p>
                        {search && <p className="text-xs">Intenta con un término de búsqueda diferente</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, sorted.length)} de {sorted.length}{" "}
                cliente{sorted.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al cliente {deleteModal.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={() => deleteModal.id && handleDelete(deleteModal.id)}
              className="flex-1"
            >
              Eliminar
            </Button>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={editModal.open} onOpenChange={(open) => !open && setEditModal({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>Modifica la información del cliente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-right">
                Nombre
              </label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Estado</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm">
                  Cliente activo
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditSave} className="flex-1">
              Guardar
            </Button>
            <Button variant="outline" onClick={() => setEditModal({ open: false })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
