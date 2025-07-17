"use client"
import { useState, useEffect } from "react"
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

import { getClientes, postCliente, putCliente, deleteCliente } from "../../../services/api"
import { ClienteUI, Cliente } from "../../../types/Cliente"

type SortField = "id" | "name" | "email" | "active" | "dni" | "telefono" | "fechaInicio" | "fechaFin" | "faltas" | "planId"
type SortDirection = "asc" | "desc"

export default function ClientesPage() {
  const [clients, setClients] = useState<ClienteUI[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean; id?: number }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number; name?: string }>({ open: false })

  // Form states for add/edit
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    fechaInicio: new Date().toISOString().split('T')[0], // Default to current date
    fechaFin: "",
    faltas: 0, // Default to 0
    planId: 1
  })

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

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
    if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;

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

  // Reset form data
  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
      fechaInicio: new Date().toISOString().split('T')[0], // Default to current date
      fechaFin: "",
      faltas: 0, // Default to 0
      planId: 1
    })
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Add new client
  const handleAddClient = async () => {
    setLoading(true)
    try {
      const newCliente: Omit<Cliente, 'clienteId'> = {
        ...formData,
        fechaInicio: formData.fechaInicio, // Already set to current date by default
        fechaFin: formData.fechaFin || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        faltas: formData.faltas || 0 // Ensure faltas is 0 by default
      }

      const result = await postCliente(newCliente)
      if (result) {
        // Add to local state
        const newClientUI: ClienteUI = {
          id: result.clienteId,
          name: `${result.nombres} ${result.apellidos}`,
          email: result.correo,
          dni: result.dni,
          telefono: result.telefono,
          fechaInicio: result.fechaInicio,
          fechaFin: result.fechaFin,
          faltas: result.faltas,
          planId: result.planId,
          active: true
        }
        setClients(prev => [...prev, newClientUI])
        setShowAdd(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding client:", error)
    } finally {
      setLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (id: number) => {
    const client = clients.find((c) => c.id === id)
    if (client) {
      // Parse name back to nombres and apellidos
      const nameParts = client.name.split(' ')
      const nombres = nameParts[0] || ""
      const apellidos = nameParts.slice(1).join(' ') || ""
      
      setFormData({
        nombres,
        apellidos,
        dni: client.dni,
        correo: client.email,
        telefono: client.telefono,
        fechaInicio: client.fechaInicio,
        fechaFin: client.fechaFin,
        faltas: client.faltas,
        planId: client.planId
      })
      setEditModal({ open: true, id })
    }
  }

  // Save edit
  const handleEditSave = async () => {
    if (!editModal.id) return

    setLoading(true)
    try {
      const updatedCliente: Cliente = {
        clienteId: editModal.id,
        ...formData,
        fechaInicio: formData.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: formData.fechaFin || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      const result = await putCliente(updatedCliente)
      if (result) {
        // Update local state
        setClients(prev => prev.map(c => 
          c.id === editModal.id 
            ? {
                ...c,
                name: `${result.nombres} ${result.apellidos}`,
                email: result.correo,
                dni: result.dni,
                telefono: result.telefono,
                fechaInicio: result.fechaInicio,
                fechaFin: result.fechaFin,
                faltas: result.faltas,
                planId: result.planId
              }
            : c
        ))
        setEditModal({ open: false })
        resetForm()
      }
    } catch (error) {
      console.error("Error updating client:", error)
    } finally {
      setLoading(false)
    }
  }

  // Delete client
  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      const success = await deleteCliente(id)
      if (success) {
        setClients(prev => prev.filter(c => c.id !== id))
        setDeleteModal({ open: false })
      }
    } catch (error) {
      console.error("Error deleting client:", error)
    } finally {
      setLoading(false)
    }
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

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true)
      try {
        const data = await getClientes()
        if (data) {
          const mapped = data.map((c) => ({
            id: c.clienteId,
            name: `${c.nombres} ${c.apellidos}`,
            email: c.correo,
            dni: c.dni,
            telefono: c.telefono,
            fechaInicio: c.fechaInicio,
            fechaFin: c.fechaFin,
            faltas: c.faltas,
            planId: c.planId,
            active: true
          }))
          setClients(mapped)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

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
                <Button className="gap-2" onClick={() => resetForm()}>
                  <Plus className="w-4 h-4" />
                  Agregar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar cliente</DialogTitle>
                  <DialogDescription>Completa la información del nuevo cliente</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="nombres" className="text-sm font-medium">Nombres</label>
                      <Input 
                        id="nombres" 
                        value={formData.nombres} 
                        onChange={(e) => handleInputChange("nombres", e.target.value)}
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidos" className="text-sm font-medium">Apellidos</label>
                      <Input 
                        id="apellidos" 
                        value={formData.apellidos} 
                        onChange={(e) => handleInputChange("apellidos", e.target.value)}
                        placeholder="Pérez"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="dni" className="text-sm font-medium">DNI</label>
                    <Input 
                      id="dni" 
                      value={formData.dni} 
                      onChange={(e) => handleInputChange("dni", e.target.value)}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label htmlFor="correo" className="text-sm font-medium">Email</label>
                    <Input 
                      id="correo" 
                      type="email"
                      value={formData.correo} 
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
                    <Input 
                      id="telefono" 
                      value={formData.telefono} 
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="fechaInicio" className="text-sm font-medium">Fecha Inicio</label>
                      <Input 
                        id="fechaInicio" 
                        type="date"
                        value={formData.fechaInicio} 
                        onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="fechaFin" className="text-sm font-medium">Fecha Fin</label>
                      <Input 
                        id="fechaFin" 
                        type="date"
                        value={formData.fechaFin} 
                        onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="faltas" className="text-sm font-medium">Faltas </label>
                      <Input 
                        id="faltas" 
                        type="number"
                        value={formData.faltas} 
                        onChange={(e) => handleInputChange("faltas", parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="planId" className="text-sm font-medium">Plan ID</label>
                      <Input 
                        id="planId" 
                        type="number"
                        value={formData.planId} 
                        onChange={(e) => handleInputChange("planId", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddClient} disabled={loading} className="flex-1">
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
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
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("dni")}
                  >
                    <div className="flex items-center">
                      DNI
                      {getSortIcon("dni")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-40 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("telefono")}
                  >
                    <div className="flex items-center">
                      Teléfono
                      {getSortIcon("telefono")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fechaInicio")}
                  >
                    <div className="flex items-center">
                      Fecha inicio
                      {getSortIcon("fechaInicio")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fechaFin")}
                  >
                    <div className="flex items-center">
                      Fecha fin
                      {getSortIcon("fechaFin")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("faltas")}
                  >
                    <div className="flex items-center">
                      Faltas
                      {getSortIcon("faltas")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-20 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("planId")}
                  >
                    <div className="flex items-center">
                      Plan
                      {getSortIcon("planId")}
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
                    <TableCell>{c.dni}</TableCell>
                    <TableCell>{c.telefono}</TableCell>
                    <TableCell>{c.fechaInicio}</TableCell>
                    <TableCell>{c.fechaFin}</TableCell>
                    <TableCell>{c.faltas}</TableCell>
                    <TableCell>{c.planId}</TableCell>
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
                    <TableCell colSpan={10} className="h-32 text-center">
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Eliminando..." : "Eliminar"}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-nombres" className="text-sm font-medium">Nombres</label>
                <Input 
                  id="edit-nombres" 
                  value={formData.nombres} 
                  onChange={(e) => handleInputChange("nombres", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-apellidos" className="text-sm font-medium">Apellidos</label>
                <Input 
                  id="edit-apellidos" 
                  value={formData.apellidos} 
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-dni" className="text-sm font-medium">DNI</label>
              <Input 
                id="edit-dni" 
                value={formData.dni} 
                onChange={(e) => handleInputChange("dni", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-correo" className="text-sm font-medium">Email</label>
              <Input 
                id="edit-correo" 
                type="email"
                value={formData.correo} 
                onChange={(e) => handleInputChange("correo", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-telefono" className="text-sm font-medium">Teléfono</label>
              <Input 
                id="edit-telefono" 
                value={formData.telefono} 
                onChange={(e) => handleInputChange("telefono", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-fechaInicio" className="text-sm font-medium">Fecha Inicio</label>
                <Input 
                  id="edit-fechaInicio" 
                  type="date"
                  value={formData.fechaInicio} 
                  onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-fechaFin" className="text-sm font-medium">Fecha Fin</label>
                <Input 
                  id="edit-fechaFin" 
                  type="date"
                  value={formData.fechaFin} 
                  onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-faltas" className="text-sm font-medium">Faltas</label>
                <Input 
                  id="edit-faltas" 
                  type="number"
                  value={formData.faltas} 
                  onChange={(e) => handleInputChange("faltas", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="edit-planId" className="text-sm font-medium">Plan ID</label>
                <Input 
                  id="edit-planId" 
                  type="number"
                  value={formData.planId} 
                  onChange={(e) => handleInputChange("planId", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditSave} disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar"}
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
