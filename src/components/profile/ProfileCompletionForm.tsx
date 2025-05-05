
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader, Upload, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define the form schema based on user role
const baseProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.any().optional(),
});

// Extended schema for customers
const customerProfileSchema = baseProfileSchema.extend({
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type BaseProfileFormValues = z.infer<typeof baseProfileSchema>;
type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;

const ProfileCompletionForm: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);

  // Determine if user is a customer
  useEffect(() => {
    if (userProfile) {
      setIsCustomer(userProfile.isCustomer || false);
      // Pre-fill form data if profile exists
      if (userProfile.firstname) {
        customerForm.setValue('firstName', userProfile.firstname);
        baseForm.setValue('firstName', userProfile.firstname);
      }
      if (userProfile.lastname) {
        customerForm.setValue('lastName', userProfile.lastname);
        baseForm.setValue('lastName', userProfile.lastname);
      }
      if (userProfile.phone) {
        customerForm.setValue('phone', userProfile.phone);
        baseForm.setValue('phone', userProfile.phone);
      }
      if (userProfile.profile_picture) {
        setAvatarUrl(userProfile.profile_picture);
      }
      
      // Fill customer specific fields
      if (isCustomer) {
        if (userProfile.dateOfBirth) {
          customerForm.setValue('dateOfBirth', userProfile.dateOfBirth);
        }
        if (userProfile.gender) {
          customerForm.setValue('gender', userProfile.gender);
        }
        if (userProfile.bloodGroup) {
          customerForm.setValue('bloodGroup', userProfile.bloodGroup);
        }
        if (userProfile.emergencyContact) {
          customerForm.setValue('emergencyContact', userProfile.emergencyContact);
        }
      }
    }
  }, [userProfile]);

  // Redirect if profile is already completed
  useEffect(() => {
    if (userProfile?.profile_completed) {
      navigate('/dashboard');
    }
  }, [userProfile, navigate]);

  // Setup base form
  const baseForm = useForm<BaseProfileFormValues>({
    resolver: zodResolver(baseProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  // Setup customer form with extended fields
  const customerForm = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      emergencyContact: '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, avatarFile);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast.error('Failed to upload avatar');
        return null;
      }

      const { data } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in avatar upload:', error);
      toast.error('Failed to upload avatar');
      return null;
    }
  };

  const onCustomerSubmit = async (values: CustomerProfileFormValues) => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Upload avatar if changed
      let profilePictureUrl = avatarUrl;
      if (avatarFile) {
        profilePictureUrl = await uploadAvatar();
      }
      
      // Update profile using the function we created
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_first_name: values.firstName,
        p_last_name: values.lastName,
        p_phone: values.phone || null,
        p_profile_picture: profilePictureUrl,
        p_date_of_birth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
        p_gender: values.gender || null,
        p_blood_group: values.bloodGroup || null,
        p_emergency_contact: values.emergencyContact || null,
        p_preferences: null, // Default preferences
      });
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        console.error('Error updating profile:', error);
      } else {
        toast.success('Profile completed successfully!');
        await refreshProfile();
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onBaseSubmit = async (values: BaseProfileFormValues) => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Upload avatar if changed
      let profilePictureUrl = avatarUrl;
      if (avatarFile) {
        profilePictureUrl = await uploadAvatar();
      }
      
      // Update profile using the function we created
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_first_name: values.firstName,
        p_last_name: values.lastName,
        p_phone: values.phone || null,
        p_profile_picture: profilePictureUrl
      });
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        console.error('Error updating profile:', error);
      } else {
        toast.success('Profile completed successfully!');
        await refreshProfile();
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const firstName = isCustomer 
      ? customerForm.getValues('firstName') 
      : baseForm.getValues('firstName');
    const lastName = isCustomer 
      ? customerForm.getValues('lastName') 
      : baseForm.getValues('lastName');

    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  // Render customer profile form
  if (isCustomer) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Patient Profile</CardTitle>
          <CardDescription>
            Tell us a bit more about yourself to get the most from our services
          </CardDescription>
        </CardHeader>

        <Form {...customerForm}>
          <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-2xl bg-healthhub-blue text-white">
                      {getInitials() || <User />}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                    <Upload size={16} />
                    <span>Upload Photo</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact info" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-healthhub-orange hover:bg-healthhub-orange/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }

  // Render base profile form for other roles
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide your information to complete your profile setup
        </CardDescription>
      </CardHeader>

      <Form {...baseForm}>
        <form onSubmit={baseForm.handleSubmit(onBaseSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-2xl bg-healthhub-blue text-white">
                    {getInitials() || <User />}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                  <Upload size={16} />
                  <span>Upload Photo</span>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={baseForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={baseForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={baseForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-healthhub-orange hover:bg-healthhub-orange/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileCompletionForm;
