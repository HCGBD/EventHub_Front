function NotFound () {
  return (
    <>
      <div className='flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900'>
        <h1 className='text-9xl font-bold text-red-500'>404</h1>
        <h2 className='text-2xl font-semibold mb-4'>Page non trouvé</h2>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          Nous sommes desolée mais cette Page n'existe 
        </p>
      </div>
    </>
  )
}

export default NotFound
