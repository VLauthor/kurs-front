"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Search, SearchIcon } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export default function Home() {
  const [cities, setCities] = useState([])
  const [activeCities, setActiveCities] = useState(null)
  const [searchCities, setSearchCities] = useState([])
  const [inputCityValue, setInputCityValue] = useState("")
  const [focusCityFld, setFocusCityFld] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [searchRestValue, setSearchRestValue] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authUser, setAuthUser] = useState(false);


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

  useEffect(() => {
    if (activeCities != null) {
      const url = `http://localhost:3000/restaurants/${activeCities.id}${searchRestValue != "" ? "/" + searchRestValue : ""}`;
      axios.get(url)
        .then(response => setRestaurants(response.data))
        .catch(e => console.log(e))
    }
  }, [activeCities, searchRestValue])

  checkAuth()


  const InputGroupInputHendler = (e: ChangeEvent<HTMLInputElement>) => {
    setInputCityValue(e.target.value);
    const url = `http://localhost:3000/cities/${inputCityValue}`;
    axios.get(url)
      .then(response => setSearchCities(response.data))
      .catch(e => console.log(e))
    console.log(restaurants);

  }
  const OnBlur = () => {
    setTimeout(() => {
      setFocusCityFld(false)
      setInputCityValue(activeCities ? activeCities.title : "")
    }, 300)
  }

  const OnCLickListCity = (item: any) => {
    setActiveCities(item)
    setInputCityValue(item.title)
  }
  return (
    <div className="min-h-screen items-center justify-center font-sans dark:bg-black flex flex-col gap-4 py-5">
      <div className="fixed top-5 flex w-full px-12 items-start justify-between duration-300 transition-all">
        <ButtonGroup orientation="vertical">
          <ButtonGroup>
            <InputGroup>
              <InputGroupInput placeholder="Найти город..." value={focusCityFld ? inputCityValue : activeCities ? activeCities.title : ""} className="font-bold" onChange={e => InputGroupInputHendler(e)}
                onFocus={() => setFocusCityFld(true)}
                onBlur={() => OnBlur()}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            {/* <Button variant="default">Выбрать</Button> */}
            <Drawer direction="top">
              <DrawerTrigger>
                <Button variant="default" className="rounded-l-none" onClick={() => {
                  axios.get('http://localhost:3000/cities/')
                    .then(response => setCities(response.data))
                    .catch(error => {
                      console.error('Error:', error);
                    });
                }}>Выбрать</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Выберите город</DrawerTitle>
                  <DrawerDescription>Гора с множеством ресторанов для Вас!</DrawerDescription>
                </DrawerHeader>
                <div className="grid grid-cols-3 w-full gap-y-5 justify-between items-center px-3">
                  {cities.map((item) => (<DrawerClose className="font-bold text-center text-foreground/80 hover:text-primary duration-300 underline hover:decoration-4 transition-all decoration-1 " key={item.id}
                    onClick={() => OnCLickListCity(item)}
                  >
                    {item.title} ({item.restaurants.length})</DrawerClose>))}

                </div>
                <DrawerFooter>
                  <DrawerClose>
                    <Button variant="outline">Отмена</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </ButtonGroup>
          {focusCityFld &&
            <div className="w-full flex flex-col gap-1 bg-card rounded-md max-h-32 overflow-y-auto">
              {searchCities.map((item) => (<Button key={item.id} variant="outline" onClick={() => OnCLickListCity(item)}>{item.title}</Button>))}
            </div>
          }
        </ButtonGroup>
        {!authUser &&
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild className="">
              <Button
                variant="default"
                className=""
                onClick={async () => {
                  await checkAuth();
                  setDialogOpen(true);
                }}
              >
                Войти
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <>
                <Tabs defaultValue="signIn">
                  <TabsList>
                    <TabsTrigger value="signIn">Авторизоваться</TabsTrigger>
                    <TabsTrigger value="signUp">Регистрация</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signIn">
                    <LoginForm onSuccess={() => {
                      setDialogOpen(false);
                      setAuthUser(true);
                    }} />
                  </TabsContent>
                  <TabsContent value="signUp">
                    <RegistrationForm onSuccess={() => {
                      setDialogOpen(false);
                      setAuthUser(true);
                    }} />
                  </TabsContent>
                </Tabs>
              </>
            </DialogContent>
          </Dialog>
        }
      </div>
      <main className="flex min-h-screen w-full flex-col items-center justify-start pt-20 px-16 bg-card border-card rounded-md dark:bg-black sm:items-start gap-4">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-4xl font-bold">Доступные рестораны: {restaurants ? restaurants.length : 0}</h1>
          <InputGroup className="max-w-1/3">
            <InputGroupInput placeholder="Найти ресторан..." value={searchRestValue} onChange={e => setSearchRestValue(e.target.value)} />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">Найдено: {restaurants ? restaurants.length : 0}</InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {restaurants.map((item) =>
            <Card key={item.id} className="w-full flex flex-row items-center justify-between" onClick={() => window.location.href = `/restaurants/${item.id}`}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <div className="flex flex-col gap-2 pr-5">
                <Badge
                  variant="secondary"
                  className="bg-primary text-white"
                >
                  Рейтинг: {item.rating}/10
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-primary text-white"
                >
                  Количество оценок: {item.ratingCount}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}



interface LoginFormProps {
  onSuccess: () => void;
}

function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === "tabs-demo-name" ? "username" : "password"]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/signIn", {
        login: formData.username,
        password: formData.password
      });

      if (response.status !== 200) {
        throw new Error("Ошибка авторизации");
      }
      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="gap-2 flex flex-col">
        <CardHeader>
          <CardTitle>Войти в аккаунт</CardTitle>
          <CardDescription>
            Введите логин и пароль чтобы войти
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="tabs-demo-name">Логин</Label>
            <Input
              id="tabs-demo-name"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="tabs-demo-username">Пароль</Label>
            <Input
              id="tabs-demo-username"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

interface RegistrationFormProps {
  onSuccess: () => void;
}

function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    login: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Пароли не совпадают");
      }

      const response = await api.post("/auth/signUp", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        login: formData.login,
        password: formData.password
      });

      if (response.status !== 201) {
        throw new Error("Ошибка регистрации");
      }

      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="gap-2 flex flex-col">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте новый аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}