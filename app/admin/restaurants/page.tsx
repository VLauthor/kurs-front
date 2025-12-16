"use client"

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Delete, Plus, Search } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Description, Dialog } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Restoran {
  id: number,
  title: string,
  description: string,
  cities: {
    title: string,
    id: number
  } | null,
  rating?: string,
  ratingCount?: number
}

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export default function Page() {
  const [authUser, setAuthUser] = useState(false);
  const [authAdmin, setAuthAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [restaurants, setRestaurants] = useState<Restoran[]>([])
  const [changeRestaurants, setChangeRestaurants] = useState<Record<number, Restoran & { isDelete: boolean, isNew: boolean }>>({})

  const handleGetCities = useCallback(() => {
    api.get('/restaurants/all').then(response => {
      setRestaurants(response.data)

      const newChangeRestaurants: Record<number, Restoran & { isDelete: boolean, isNew: boolean }> = {};

      response.data.forEach((restoran: Restoran) => {
        newChangeRestaurants[restoran.id] = {
          ...restoran,
          isDelete: false,
          isNew: false
        };
      });

      setChangeRestaurants(newChangeRestaurants);
    });
  }, []);

  const handleAddCity = useCallback(() => {
    setChangeRestaurants(oldData => {
      let maxId = 0
      Object.values(oldData).forEach((el) => {
        if (el.id > maxId) maxId = el.id
      })
      maxId++

      const newData = { ...oldData }
      newData[maxId] = { isNew: true, isDelete: false, id: maxId, title: '', description: '', cities: null, rating: "0.0", ratingCount: 0 }
      return newData
    })
  }, [])


  const checkAuth = async () => {
    try {
      const response = await api.get('/auth');
      setAuthUser(response.status === 200);
      return response.status === 200;
    } catch (error) {
      setAuthUser(false);
      return false;
    }
  }

  const checkAdmin = async () => {
    try {
      const response = await api.get('/auth/checkAdmin');
      setAuthAdmin(response.data);
    } catch (error) {
      setAuthAdmin(false);
      return false;
    }
  }

  useEffect(async () => {
    await checkAuth();
    await checkAdmin();
  }, []);

  useEffect(() => {
    handleGetCities()

  }, [handleGetCities])

  if (!authUser) {
    return <div className="w-full h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Ошибка доступа</CardTitle>
          <CardDescription>Вы не авторизованы</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.href = '/'}>Вернуться на главную</Button>
        </CardFooter>
      </Card>
    </div>
  }

  if (!authAdmin) {
    return <div className="w-full h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Ошибка доступа</CardTitle>
          <CardDescription>Вы не администратор</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.href = '/'}>Вернуться на главную</Button>
        </CardFooter>
      </Card>
    </div>
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogTrigger asChild className="hidden">
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Заполните поля City</AlertDialogTitle>
            <AlertDialogDescription>
              Чтобы сохранить записи необходимло заполнить поле City
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ок</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">id</TableHead>
            <TableHead>title</TableHead>
            <TableHead>description</TableHead>
            <TableHead>city</TableHead>
            <TableHead>rating</TableHead>
            <TableHead>ratingCount</TableHead>
            <TableHead>
              <Button onClick={handleAddCity}><Plus /></Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(changeRestaurants).map((restaurant) => {
            if (restaurant.isDelete) return null

            return (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">
                  <Input value={restaurant.id} readOnly />
                </TableCell>
                <TableCell>
                  <Input
                    value={restaurant.title}
                    onChange={(e) => setChangeRestaurants(old => {
                      const updated = { ...old }
                      updated[restaurant.id] = { ...updated[restaurant.id], title: e.target.value }
                      return updated
                    })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={restaurant.description}
                    onChange={(e) => setChangeRestaurants(old => {
                      const updated = { ...old }
                      updated[restaurant.id] = { ...updated[restaurant.id], description: e.target.value }
                      return updated
                    })}
                  />
                </TableCell>
                <TableCell>
                  <AxLookup title={restaurant.cities?.title || ""} onSelect={(id, title) => {
                    setChangeRestaurants(old => {
                      const updated = { ...old }
                      updated[restaurant.id] = { ...updated[restaurant.id], cities: { id: id, title: title } }
                      return updated
                    })
                  }
                  } />
                </TableCell>
                <TableCell>
                  <Input
                    value={restaurant.rating}
                    readOnly
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={restaurant.ratingCount}
                    readOnly
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Button
                    onClick={() => setChangeRestaurants(oldData => {
                      const updated = { ...oldData }
                      updated[restaurant.id] = { ...updated[restaurant.id], isDelete: true }
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
              {Object.values(changeRestaurants).filter(e => e.isDelete === false).length}
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
            const values = Object.values(changeRestaurants)
            const promises = values.map(element => {
              if (element.isDelete) {
                return api.delete('/restaurants', { data: { id: element.id } })
              } else if (element.isNew) {
                if (!element.cities?.id) return setShowAlert(true)
                return api.post('/restaurants', { title: element.title, city_id: element.cities?.id, description: element.description })
              } else {
                return api.put('/restaurants', { id: element.id, title: element.title, city_id: element.cities?.id, description: element.description })
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

function AxLookup({ title, onSelect }: { title: string, onSelect: (id: number, title: string) => void }) {
  const [dialog, setDialog] = useState(false)
  return <Dialog open={dialog} onOpenChange={setDialog}>

    <DialogTrigger asChild>
      <ButtonGroup>
        <Input
          value={title}
          readOnly
        />
        <Button><Search /></Button>
      </ButtonGroup>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Выберите значение</DialogTitle>
      </DialogHeader>
      <CityTable onSelect={onSelect} setDialog={() => setDialog(false)} />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Отмена</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>

  </Dialog>
}

function CityTable({ onSelect, setDialog }: { onSelect: (id: number, title: string) => void, setDialog: () => void }) {
  const [changeCities, setChangeCities] = useState<Record<number, { id: number, title: string, isDelete: boolean, isNew: boolean }>>({})
  const handleGetCities = () => {
    api.get('/cities').then(response => {
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
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">id</TableHead>
        <TableHead>title</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Object.values(changeCities).map((city) => {
        if (city.isDelete) return null

        return (
          <TableRow key={city.id} onClick={() => {
            onSelect(city.id, city.title)
            setDialog()
          }}>
            <TableCell className="font-medium">
              {city.id}
            </TableCell>
            <TableCell>
              {city.title}
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
}