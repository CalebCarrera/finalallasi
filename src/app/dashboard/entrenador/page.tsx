"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  XCircle, 
  CheckCircle,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Entrenador, EntrenadorFormData } from "@/services/types/Entrenador"

// Datos de ejemplo para entrenadores
const entrenadoresData: Entrenador[] = [
  {
    id: 1,
    nombres: "Carlos",
    apellidos: "García",
    dni: "12345678",
    correo: "carlos.garcia@gym.com",
    telefono: "+51 999 111 111",
    especialidad: "Musculación",
    experiencia: 5,
    fechaContratacion: "2020-01-15",
    salario: 2500,
    active: true
  },
  {
    id: 2,
    nombres: "Ana",
    apellidos: "Martínez",
    dni: "87654321",
    correo: "ana.martinez@gym.com",
    telefono: "+51 999 222 222",
    especialidad: "Yoga",
    experiencia: 3,
    fechaContratacion: "2021-03-20",
    salario: 2200,
    active: true
  },
  {
    id: 3,
    nombres: "Luis",
    apellidos: "Rodríguez",
    dni: "11223344",
    correo: "luis.rodriguez@gym.com",
    telefono: "+51 999 333 333",
    especialidad: "CrossFit",
    experiencia: 7,
    fechaContratacion: "2018-06-10",
    salario: 2800,
    active: true
  },
  {
    id: 4,
    nombres: "María",
    apellidos: "López",
    dni: "44332211",
    correo: "maria.lopez@gym.com",
    telefono: "+51 999 444 444",
    especialidad: "Pilates",
    experiencia: 4,
    fechaContratacion: "2020-09-05",
    salario: 2300,
    active: false
  },
  {
    id: 5,
    nombres: "Roberto",
    apellidos: "Hernández",
    dni: "55667788",
    correo: "roberto.hernandez@gym.com",
    telefono: "+51 999 555 555",
    especialidad: "Spinning",
    experiencia: 6,
    fechaContratacion: "2019-02-12",
    salario: 2400,
    active: true
  }
]

export default function EntrenadorPage() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>(entrenadoresData)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Entrenador>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<EntrenadorFormData>({
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    especialidad: "",
    experiencia: 0,
    fechaContratacion: "",
    salario: 0
  })

  // Filtrar y ordenar entrenadores
  const filtered = useMemo(() => {
    return entrenadores.filter((e) => {
      const searchTerm = search.toLowerCase()
      return (
        e.nombres.toLowerCase().includes(searchTerm) ||
        e.apellidos.toLowerCase().includes(searchTerm) ||
        e.correo.toLowerCase().includes(searchTerm) ||
        e.dni.includes(searchTerm) ||
        e.especialidad.toLowerCase().includes(searchTerm)
      )
    })
  }, [entrenadores, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  }, [filtered, sortField, sortDirection])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page])

  const totalPages = Math.ceil(sorted.length / pageSize)

  // Funciones de manejo
  const handleSort = (field: keyof Entrenador) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Entrenador) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const handleInputChange = (field: keyof EntrenadorFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
      especialidad: "",
      experiencia: 0,
      fechaContratacion: "",
      salario: 0
    })
  }

  const handleAddEntrenador = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.dni) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newEntrenador: Entrenador = {
      id: Math.max(...entrenadores.map(e => e.id)) + 1,
      ...formData,
      active: true
    }

    setEntrenadores(prev => [...prev, newEntrenador])
    setShowAdd(false)
    resetForm()
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const entrenador = entrenadores.find(e => e.id === id)
    if (entrenador) {
      setFormData({
        nombres: entrenador.nombres,
        apellidos: entrenador.apellidos,
        dni: entrenador.dni,
        correo: entrenador.correo,
        telefono: entrenador.telefono,
        especialidad: entrenador.especialidad,
        experiencia: entrenador.experiencia,
        fechaContratacion: entrenador.fechaContratacion,
        salario: entrenador.salario
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.dni) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setEntrenadores(prev => 
      prev.map(e => 
        e.id === editModal.id 
          ? { ...e, ...formData }
          : e
      )
    )
    setEditModal({ open: false, id: 0 })
    resetForm()
    setLoading(false)
  }

  const openDeleteModal = (id: number) => {
    const entrenador = entrenadores.find(e => e.id === id)
    if (entrenador) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: `${entrenador.nombres} ${entrenador.apellidos}` 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setEntrenadores(prev => prev.filter(e => e.id !== id))
    setDeleteModal({ open: false, id: 0, name: "" })
    setLoading(false)
  }

  const toggleEntrenadorStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setEntrenadores(prev => 
      prev.map(e => 
        e.id === id 
          ? { ...e, active: !e.active }
          : e
      )
    )
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Entrenadores</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de entrenadores de manera eficiente</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Users className="w-4 h-4 mr-1" />
          {filtered.length} entrenador{filtered.length !== 1 ? "es" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar entrenador..."
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
                  Agregar Entrenador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar entrenador</DialogTitle>
                  <DialogDescription>Completa la información del nuevo entrenador</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="nombres" className="text-sm font-medium">Nombres</label>
                      <Input 
                        id="nombres" 
                        value={formData.nombres} 
                        onChange={(e) => handleInputChange("nombres", e.target.value)}
                        placeholder="Carlos"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidos" className="text-sm font-medium">Apellidos</label>
                      <Input 
                        id="apellidos" 
                        value={formData.apellidos} 
                        onChange={(e) => handleInputChange("apellidos", e.target.value)}
                        placeholder="García"
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
                      placeholder="carlos@gym.com"
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
                  <div>
                    <label htmlFor="especialidad" className="text-sm font-medium">Especialidad</label>
                    <Input 
                      id="especialidad" 
                      value={formData.especialidad} 
                      onChange={(e) => handleInputChange("especialidad", e.target.value)}
                      placeholder="Musculación"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="experiencia" className="text-sm font-medium">Experiencia (años)</label>
                      <Input 
                        id="experiencia" 
                        type="number"
                        value={formData.experiencia} 
                        onChange={(e) => handleInputChange("experiencia", parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="salario" className="text-sm font-medium">Salario (S/)</label>
                      <Input 
                        id="salario" 
                        type="number"
                        value={formData.salario} 
                        onChange={(e) => handleInputChange("salario", parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="fechaContratacion" className="text-sm font-medium">Fecha Contratación</label>
                    <Input 
                      id="fechaContratacion" 
                      type="date"
                      value={formData.fechaContratacion} 
                      onChange={(e) => handleInputChange("fechaContratacion", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddEntrenador} disabled={loading} className="flex-1">
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
                    onClick={() => handleSort("nombres")}
                  >
                    <div className="flex items-center">
                      Nombre
                      {getSortIcon("nombres")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("correo")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("correo")}
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
                    onClick={() => handleSort("especialidad")}
                  >
                    <div className="flex items-center">
                      Especialidad
                      {getSortIcon("especialidad")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("experiencia")}
                  >
                    <div className="flex items-center">
                      Exp. (años)
                      {getSortIcon("experiencia")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fechaContratacion")}
                  >
                    <div className="flex items-center">
                      Contratación
                      {getSortIcon("fechaContratacion")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("salario")}
                  >
                    <div className="flex items-center">
                      Salario
                      {getSortIcon("salario")}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((e) => (
                  <TableRow key={e.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{e.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{e.nombres} {e.apellidos}</TableCell>
                    <TableCell className="text-muted-foreground">{e.correo}</TableCell>
                    <TableCell>{e.dni}</TableCell>
                    <TableCell>{e.telefono}</TableCell>
                    <TableCell>{e.especialidad}</TableCell>
                    <TableCell>{e.experiencia}</TableCell>
                    <TableCell>{e.fechaContratacion}</TableCell>
                    <TableCell>S/ {e.salario.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(e.id)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEntrenadorStatus(e.id)} className="cursor-pointer">
                            {e.active ? (
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
                            onClick={() => openDeleteModal(e.id)}
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
                        <p className="text-sm">No se encontraron entrenadores</p>
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
                entrenador{sorted.length !== 1 ? "es" : ""}
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
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, id: 0, name: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al entrenador {deleteModal.name}? Esta acción no se puede deshacer.
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
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: 0, name: "" })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={editModal.open} onOpenChange={(open) => !open && setEditModal({ open: false, id: 0 })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar entrenador</DialogTitle>
            <DialogDescription>Modifica la información del entrenador.</DialogDescription>
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
            <div>
              <label htmlFor="edit-especialidad" className="text-sm font-medium">Especialidad</label>
              <Input 
                id="edit-especialidad" 
                value={formData.especialidad} 
                onChange={(e) => handleInputChange("especialidad", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-experiencia" className="text-sm font-medium">Experiencia (años)</label>
                <Input 
                  id="edit-experiencia" 
                  type="number"
                  value={formData.experiencia} 
                  onChange={(e) => handleInputChange("experiencia", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="edit-salario" className="text-sm font-medium">Salario (S/)</label>
                <Input 
                  id="edit-salario" 
                  type="number"
                  value={formData.salario} 
                  onChange={(e) => handleInputChange("salario", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-fechaContratacion" className="text-sm font-medium">Fecha Contratación</label>
              <Input 
                id="edit-fechaContratacion" 
                type="date"
                value={formData.fechaContratacion} 
                onChange={(e) => handleInputChange("fechaContratacion", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditSave} disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="outline" onClick={() => setEditModal({ open: false, id: 0 })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
