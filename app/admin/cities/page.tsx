"use client"

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Delete, Plus } from "lucide-react";


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export default function Page() {
  const [isSaving, setIsSaving] = useState(false)
  const [cities, setCities] = useState<{ id: number, title: string }[]>([])
  const [changeCities, setChangeCities] = useState<Record<number, { id: number, title: string, isDelete: boolean, isNew: boolean }>>({})

  const handleGetCities = () => {
    api.get('/cities').then(response => {
      setCities(response.data)
      const initialData: Record<number, { id: number, title: string, isDelete: boolean, isNew: boolean }> = {}
      response.data.forEach((city: { id: number, title: string }) => {
        initialData[city.id] = { ...city, isDelete: false, isNew: false }
      })
      setChangeCities(initialData)
    })
  }
  useEffect(() => {
    handleGetCities()
  }, [])

  // Используем useCallback для стабильной ссылки на функцию
  const handleAddCity = useCallback(() => {
    setChangeCities(oldData => {
      let maxId = 0
      Object.values(oldData).forEach((el) => {
        if (el.id > maxId) maxId = el.id
      })
      maxId++

      // Создаем новый объект, а не мутируем старый
      const newData = { ...oldData }
      newData[maxId] = { isNew: true, isDelete: false, id: maxId, title: '' }
      return newData
    })
  }, [])

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">id</TableHead>
            <TableHead>title</TableHead>
            <TableHead>
              <Button onClick={handleAddCity}><Plus /></Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(changeCities).map((city) => {
            if (city.isDelete) return null

            return (
              <TableRow key={city.id}>
                <TableCell className="font-medium">
                  <Input value={city.id} readOnly />
                </TableCell>
                <TableCell>
                  <Input
                    value={city.title}
                    onChange={(e) => setChangeCities(old => {
                      const updated = { ...old }
                      updated[city.id] = { ...updated[city.id], title: e.target.value }
                      return updated
                    })}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Button
                    onClick={() => setChangeCities(oldData => {
                      const updated = { ...oldData }
                      updated[city.id] = { ...updated[city.id], isDelete: true }
                      return updated
                    })}
                  >
                    <Delete />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Всего:</TableCell>
            <TableCell className="text-right">
              {Object.values(changeCities).filter(e => e.isDelete === false).length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Button
        className="mx-3"
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true)
          try {
            const values = Object.values(changeCities)
            const promises = values.map(element => {
              if (element.isDelete) {
                return api.delete('/cities', { data: { id: element.id } })
              } else if (element.isNew) {
                return api.post('/cities', { title: element.title })
              } else {
                return api.put('/cities', { title: element.title, id: element.id })
              }
            })

            await Promise.all(promises)

          } catch (error) {
            console.error('Error during save:', error)
          } finally {
            await handleGetCities()
            setIsSaving(false)
          }
        }}
      >
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div >
  )
}