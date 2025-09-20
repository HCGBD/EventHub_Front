import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import AuthLayout from '../layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerUser } from '@/lib/api'

const formSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['participant', 'organizer'])
})

export default function RegisterPage () {
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'participant'
    }
  })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Inscription réussie !')
      navigate('/verify-email')
    },
    onError: error => {
      const errorMessage = error.response?.data?.message || error.message
      toast.error(`Erreur d'inscription: ${errorMessage}`)
    }
  })

  const onSubmit = values => {
    mutation.mutate(values)
  }

  return (
    <AuthLayout>
      <div className='w-full '>
        <div className='text-center mt-2 mb-6'>
          <h2 className='text-4xl text-white font-bold'>Créer un Compte</h2>
          <p className='text-white mt-3'>Rejoignez la communauté EventHub.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='nom'
                className={'text-xl text-gray-50  font-bold '}
              >
                Nom
              </Label>
              <Input
                id='nom'
                {...form.register('nom')}
                disabled={mutation.isPending}
                className={'bg-white  rounded-full'}
              />
              {form.formState.errors.nom && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.nom.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='prenom'
                className={'text-xl text-gray-50  font-bold '}
              >
                Prénom
              </Label>
              <Input
                id='prenom'
                {...form.register('prenom')}
                disabled={mutation.isPending}
                className={'bg-white  rounded-full'}
              />
              {form.formState.errors.prenom && (
                <p className='text-sm text-red-500'>
                  {form.formState.errors.prenom.message}
                </p>
              )}
            </div>
          </div>
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
              className={'text-xl text-gray-50  font-bold '}
            >
              Mot de passe
            </Label>
            <Input
              id='password'
              type='password'
              {...form.register('password')}
              disabled={mutation.isPending}
              className={'bg-white  rounded-full'}
            />
            {form.formState.errors.password && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className={'text-white'}>
              Je souhaite m'inscrire en tant que :
            </Label>
            <div className='flex items-center space-x-4 pt-2'>
              <div className='flex items-center space-x-2'>
                <input
                  type='radio'
                  id='role-participant'
                  value='participant'
                  {...form.register('role')}
                  disabled={mutation.isPending}
                />
                <Label
                  htmlFor='role-participant'
                  className='font-normal text-white'
                >
                  Participant
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='radio'
                  id='role-organizer'
                  value='organizer'
                  {...form.register('role')}
                  disabled={mutation.isPending}
                />
                <Label
                  htmlFor='role-organizer'
                  className='font-normal text-white'
                >
                  Organisateur
                </Label>
              </div>
            </div>
            {form.formState.errors.role && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.role.message}
              </p>
            )}
          </div>
          <div className='flex justify-center items-center'>
            <Button
              type='submit'
              disabled={mutation.isPending}
              className='w-60  mt-2 font-extrabold text-2xl py-7 rounded-full bg-green-500 hover:bg-green-700'
            >
              {mutation.isPending ? 'Création du compte...' : "S'inscrire"}
            </Button>
          </div>
        </form>
        <p className='mt-3 text-center  mb-3 text-gray-50 '>
          Déjà un compte ?{' '}
          <a href='/login' className='font-medium   hover:underline hover:decoration-green-500'>
            <span className='text-green-400'> Connectez-vous</span>
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
