"use client"

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export default function Page() {
  const [authUser, setAuthUser] = useState(false);
  const [authAdmin, setAuthAdmin] = useState(false);

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
  return <div className="w-full h-screen flex flex-col"></div>
}