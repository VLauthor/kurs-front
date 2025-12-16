"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

interface PageProps {
  params: Promise<{
    ':id': number;
  }>;
}

interface Restaurant {
  id: number;
  title: string;
  description: string;
  rating: number;
  ratingCount: number;
  reviews: {
    id: number,
    rating: number,
    title: string,
    description: string,
    user: {
      id: number,
      lastName: string,
      firstName: string
    }
  }[]
}

interface ReviewFormData {
  rating: number;
  title: string;
  description: string;
}

export default function Page({ params }: PageProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);

  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    title: "",
    description: ""
  });

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const param = await params;
      const id = Number(param[':id']);
      setId(id)
      const response = await api.get(`/restaurants/id/${id}`);
      setRestaurant(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError("Ресторан не найден");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [params]);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    try {
      if (!restaurant) {
        throw new Error("Ресторан не загружен");
      }

      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error("Вы не авторизованы");
      }

      if (reviewForm.rating < 1 || reviewForm.rating > 10) {
        throw new Error("Рейтинг должен быть от 1 до 10");
      }

      if (!reviewForm.title.trim()) {
        throw new Error("Заголовок обязателен");
      }

      if (!reviewForm.description.trim()) {
        throw new Error("Описание обязательно");
      }

      const response = await api.post(`/reviews`, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        description: reviewForm.description,
        restaurants_id: id
      });

      if (response.status === 200) {
        await fetchRestaurant();

        setDialogOpen(false);

        setReviewForm({
          rating: 5,
          title: "",
          description: ""
        });
        alert("Отзыв успешно отправлен!");
      } else {
        throw new Error("Ошибка при отправке отзыва");
      }

    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err instanceof Error ? err.message : "Произошла ошибка при отправке отзыва");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewFormChange = (field: keyof ReviewFormData, value: string | number) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
    if (reviewError) setReviewError(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <div className="w-full p-4">Загрузка...</div>;
  }

  if (error || !restaurant) {
    return (
      <div className="w-full p-4 text-center">
        <h2 className="text-2xl font-bold text-red-500">404</h2>
        <p className="text-gray-600">Ресторан не найден</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 gap-4 flex flex-col">
      <div className="fixed top-3 left-3 p-1 bg-background border rounded-4xl" onClick={() => window.location.href = '/'} ><ArrowLeft /></div>
      <Card key={restaurant.id} className="w-full flex flex-col items-start">
        <CardHeader className="w-full">
          <CardTitle>
            <p className="font-bold text-2xl">Название ресторана</p>
            <Input readOnly value={restaurant.title} className="w-full h-fit" />
          </CardTitle>
          <CardDescription>
            <p className="font-bold text-xl text-foreground">Описание ресторана</p>
            <Input readOnly value={restaurant.description} className="w-full h-fit text-foreground" />
          </CardDescription>
        </CardHeader>
        <div className="flex gap-12 items-center justify-center pr-5 w-full">
          <Badge
            variant="secondary"
            className="bg-primary text-white"
          >
            Рейтинг: {restaurant.rating}/10
          </Badge>
          <Badge
            variant="secondary"
            className="bg-primary text-white"
          >
            Количество оценок: {restaurant.ratingCount}
          </Badge>
        </div>
      </Card>
      <Card className="w-full flex flex-col items-start justify-center">
        <CardHeader className="w-full">
          <CardTitle>Отзывы</CardTitle>
          <CardDescription>Ниже предоставлены оставленные отзывы о данном месте</CardDescription>
        </CardHeader>
        <CardContent className="w-full flex flex-col gap-2">
          <div className="flex w-full border">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild className="w-full">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={async () => {
                    await checkAuth();
                    setDialogOpen(true);
                  }}
                >
                  Оставить отзыв
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {authUser ? (
                  <form onSubmit={handleSubmitReview}>
                    <DialogHeader>
                      <DialogTitle>Оставить отзыв</DialogTitle>
                      <DialogDescription>
                        Напишите ваш отзыв о ресторане
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-3">
                        <Label htmlFor="rating">Рейтинг (1-10)</Label>
                        <Input
                          id="rating"
                          name="rating"
                          type="number"
                          min="1"
                          max="10"
                          value={reviewForm.rating}
                          onChange={(e) => handleReviewFormChange('rating', parseInt(e.target.value) || 5)}
                          disabled={reviewLoading}
                          required
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="review-title">Заголовок *</Label>
                        <Input
                          id="review-title"
                          name="title"
                          value={reviewForm.title}
                          onChange={(e) => handleReviewFormChange('title', e.target.value)}
                          disabled={reviewLoading}
                          required
                          placeholder="Краткий заголовок отзыва"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="review-description">Описание *</Label>
                        <Textarea
                          id="review-description"
                          name="description"
                          value={reviewForm.description}
                          onChange={(e) => handleReviewFormChange('description', e.target.value)}
                          disabled={reviewLoading}
                          required
                          placeholder="Подробное описание вашего опыта"
                          rows={4}
                        />
                      </div>

                      {/* Отображение ошибки отправки отзыва */}
                      {reviewError && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                          {reviewError}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          type="button"
                          disabled={reviewLoading}
                        >
                          Отмена
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? "Отправка..." : "Отправить отзыв"}
                      </Button>
                    </DialogFooter>
                  </form>
                ) : (
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
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Список отзывов */}
          {restaurant.reviews.length > 0 ? (
            restaurant.reviews.map(item => (
              <Card key={item.id} className="gap-0">
                <CardHeader className="w-full flex items-center justify-between">
                  <CardTitle>{item.user.lastName} {item.user.firstName}</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-primary text-white"
                  >
                    {item.rating}/10
                  </Badge>
                </CardHeader>
                <CardContent className="w-full flex flex-col">
                  <p className="text-xl font-bold">{item.title}</p>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-gray-500">Пока нет отзывов. Будьте первым!</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
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