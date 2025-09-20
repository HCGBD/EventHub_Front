import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import AuthLayout from '../layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginUser } from '@/lib/api'
import useAuthStore from '@/stores/authStore'

const formSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

export default function LoginPage () {
  const navigate = useNavigate()
  const setToken = useAuthStore(state => state.setToken)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' }
  })

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      toast.success('Connexion réussie !')
      setToken(data.accessToken, data.user)
      // Invalider les caches pour forcer le rechargement des données après connexion
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['locations'])
      const role = data.user.role
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else if (role === 'organizer') {
        navigate('/organizer/dashboard')
      } else if (role === 'participant') {
        navigate('/participant')
      } else {
        navigate('/') // Fallback pour la page d'accueil
      }
    },
    onError: error => {
      const errorMessage = error.response?.data?.message || error.message
      toast.error(`Erreur de connexion: ${errorMessage}`)
    }
  })

  const onSubmit = values => {
    mutation.mutate(values)
  }

  return (
    <AuthLayout>
      <div className='w-full'>
        <div className='text-center mb-6'>
          <h2 className='text-4xl text-white font-bold'>Connexion</h2>
          <p className='text-white mt-3'>
            Accédez à votre Espace dans EventHub.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className={'text-xl text-gray-50  font-bold '}
            >
              Email
            </Label>
            <Input
              id='email'
              type='email'
              {...form.register('email')}
              disabled={mutation.isPending}
              className={'bg-white  rounded-full'}
            />
            {form.formState.errors.email && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor='password'
              className={'text-xl font-bold text-gray-50  '}
            >
              Mot de passe
            </Label>
            <Input
              id='password'
              type='password'
              {...form.register('password')}
              disabled={mutation.isPending}
              className={'bg-white rounded-full'}
            />
            {form.formState.errors.password && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className='flex justify-center items-center'>
            <Button
              type='submit'
              className='w-60  mt-2 font-extrabold text-2xl py-7 rounded-full bg-green-500 hover:bg-green-700'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </div>
        </form>
        <p className='mt-6 text-center text-gray-50  '>
          Pas encore de compte ?{' '}
          <a
            href='/register'
            className='font-medium text-primary hover:underline hover:decoration-green-500'
          >
            <span className='text-green-400'>Inscrivez-vous</span>
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
