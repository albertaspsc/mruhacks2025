// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { useEffect, useState } from "react"
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Loader2 } from "lucide-react"
// import { toast } from "@/components/hooks/use-toast"

// // Profile form schema
// const profileFormSchema = z.object({
//   firstName: z.string().min(2, {
//     message: "First name must be at least 2 characters.",
//   }),
//   lastName: z.string().min(2, {
//     message: "Last name must be at least 2 characters.",
//   }),
//   email: z.string().email({
//     message: "Please enter a valid email address.",
//   }),
// })

// // Password form schema
// const passwordFormSchema = z.object({
//   currentPassword: z.string().min(6, {
//     message: "Current password must be at least 6 characters.",
//   }),
//   newPassword: z.string().min(8, {
//     message: "New password must be at least 8 characters.",
//   }),
//   confirmPassword: z.string().min(8, {
//     message: "Confirm password must be at least 8 characters.",
//   }),
// }).refine((data) => data.newPassword === data.confirmPassword, {
//   message: "New passwords don't match",
//   path: ["confirmPassword"],
// })

// type ProfileFormValues = z.infer<typeof profileFormSchema>
// type PasswordFormValues = z.infer<typeof passwordFormSchema>

// export default function SettingsPage() {
//   const [isLoading, setIsLoading] = useState(true)
//   const [user, setUser] = useState<any>(null)
//   const supabase = createClientComponentClient()

//   // Profile form
//   const profileForm = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//     },
//   })

//   // Password form
//   const passwordForm = useForm<PasswordFormValues>({
//     resolver: zodResolver(passwordFormSchema),
//     defaultValues: {
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     },
//   })

//   // Fetch user data
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()

//         if (!session) {
//           return
//         }

//         const { data: profile, error } = await supabase
//           .from('profile')
//           .select('id, email, f_name, l_name')
//           .eq('id', session.user.id)
//           .single()

//         if (error) {
//           throw error
//         }

//         setUser({
//           id: profile.id,
//           email: profile.email,
//           firstName: profile.f_name || '',
//           lastName: profile.l_name || '',
//         })

//         profileForm.reset({
//           firstName: profile.f_name || '',
//           lastName: profile.l_name || '',
//           email: profile.email,
//         })
//       } catch (error) {
//         console.error('Error fetching profile:', error)
//         toast({
//           title: "Error",
//           description: "Failed to load profile data",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUserData()
//   }, [supabase, profileForm])

//   // Handle profile form submission
//   async function onProfileSubmit(data: ProfileFormValues) {
//     setIsLoading(true)

//     try {
//       // Update profile in database
//       const { error: profileError } = await supabase
//         .from('profile')
//         .update({
//           f_name: data.firstName,
//           l_name: data.lastName,
//           email: data.email,
//         })
//         .eq('id', user.id)

//       if (profileError) {
//         throw profileError
//       }

//       // Update email in auth if changed
//       if (data.email !== user.email) {
//         const { error: emailError } = await supabase.auth.updateUser({
//           email: data.email,
//         })

//         if (emailError) {
//           throw emailError
//         }
//       }

//       toast({
//         title: "Profile updated",
//         description: "Your profile information has been updated successfully.",
//       })
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update profile",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle password form submission
//   async function onPasswordSubmit(data: PasswordFormValues) {
//     setIsLoading(true)

//     try {
//       const { error } = await supabase.auth.updateUser({
//         password: data.newPassword,
//       })

//       if (error) {
//         throw error
//       }

//       passwordForm.reset({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       })

//       toast({
//         title: "Password updated",
//         description: "Your password has been changed successfully.",
//       })
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update password",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isLoading && !user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
//       </div>
//     )
//   }

//   return (
//     <div className="container max-w-4xl py-10">
//       <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

//       <Tabs defaultValue="profile" className="w-full">
//         <TabsList className="mb-8">
//           <TabsTrigger value="profile">Profile Information</TabsTrigger>
//           <TabsTrigger value="password">Password</TabsTrigger>
//         </TabsList>

//         {/* Profile Tab */}
//         <TabsContent value="profile">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Information</CardTitle>
//               <CardDescription>
//                 Update your personal information and email address.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Form {...profileForm}>
//                 <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
//                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                     <FormField
//                       control={profileForm.control}
//                       name="firstName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>First Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="First Name" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={profileForm.control}
//                       name="lastName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Last Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Last Name" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <FormField
//                     control={profileForm.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Email" type="email" {...field} />
//                         </FormControl>
//                         <FormDescription>
//                           This is the email used for communication and login.
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <Button type="submit" disabled={isLoading}>
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Save Changes
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Password Tab */}
//         <TabsContent value="password">
//           <Card>
//             <CardHeader>
//               <CardTitle>Change Password</CardTitle>
//               <CardDescription>
//                 Update your password for enhanced security.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Form {...passwordForm}>
//                 <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
//                   <FormField
//                     control={passwordForm.control}
//                     name="currentPassword"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Current Password</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Current Password" type="password" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={passwordForm.control}
//                     name="newPassword"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>New Password</FormLabel>
//                         <FormControl>
//                           <Input placeholder="New Password" type="password" {...field} />
//                         </FormControl>
//                         <FormDescription>
//                           Password must be at least 8 characters long.
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={passwordForm.control}
//                     name="confirmPassword"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Confirm New Password</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Confirm New Password" type="password" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <Button type="submit" disabled={isLoading}>
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Change Password
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
