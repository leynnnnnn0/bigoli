import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ChevronLeft, ChevronRight, User, Wallet, ShoppingCart, Plus, Camera, Type, Trophy, Award, Calendar } from 'lucide-react';
import { router, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LOGO from "../../../../images/mainLogo.png";

import { useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface Perk {
  id: number;
  stampNumber: number;
  reward: string;
  details: string | null;
  color: string;
}

interface LoyaltyCard {
  id: number;
  logo: string | null;
  name: string;
  heading: string;
  subheading: string;
  stampsNeeded: number;
  mechanics: string;
  backgroundColor: string;
  textColor: string;
  stampColor: string;
  stampFilledColor: string;
  stampEmptyColor: string;
  valid_until_formatted: string;
  stampImage: string | null;
  backgroundImage: string | null;
  footer: string;
  stampShape: 'circle' | 'star' | 'square' | 'hexagon';
  perks: Perk[];
}

interface StampCode {
  id: number;
  loyalty_card_id: number;
  code: string;
  used_at: string;
  customer_id: number;
}

interface CompletedCard {
  id: number;
  loyalty_card_id: number;
  loyalty_card_name: string;
  stamps_collected: number;
  completed_at: string;
  card_cycle: number;
  stamps_data: Array<{
    id: number;
    code: string;
    used_at: string;
  }>;
}
interface PerkClaim {
  id: number;
  customer_id: number;
  loyalty_card_id: number;
  perk_id: number;
  stamps_at_claim: number;
  is_redeemed: boolean;
  redeemed_at: string | null;
  redeemed_by: number | null;
  remarks: string | null;
  created_at: string;
  perk: Perk;
  loyalty_card: {
    id: number;
    name: string;
    logo: string | null;
  };
}

interface Props {
  cardTemplates: LoyaltyCard[];
  stampCodes: StampCode[];
  completedCards: CompletedCard[];
  customerName: string;
  active_card_id?: number;
  perkClaims: PerkClaim[];
  customer: {
    username: string,
  }
}

export default function Index({ cardTemplates, stampCodes, completedCards, customerName, perkClaims, customer }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedCompletedCard, setSelectedCompletedCard] = useState<CompletedCard | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const { flash } = usePage().props as any;
const controlsRef = useRef<any>(null);
  const { data, setData, errors, post, processing, reset } = useForm({
    code: '',
    loyalty_card_id: cardTemplates[0]?.id || null,
  });

  // Add these state variables with your other useState declarations
const [profileDialogOpen, setProfileDialogOpen] = useState(false);
const [profileTab, setProfileTab] = useState('info');

// Add these form handlers after your existing useForm declarations
const { data: profileData, setData: setProfileData, errors: profileErrors, post: postProfile, processing: profileProcessing, reset: resetProfile } = useForm({
  username: customer.username,
});

const { data: passwordData, setData: setPasswordData, errors: passwordErrors, post: postPassword, processing: passwordProcessing, reset: resetPassword } = useForm({
  current_password: '',
  password: '',
  password_confirmation: '',
});

// Add submit handlers
const handleUpdateProfile = (e: React.FormEvent) => {
  e.preventDefault();
  postProfile('/customer/profile/update', {
    onSuccess: () => {
      toast.success('Profile updated successfully');
      resetProfile();
    },
    onError: (e) => {
       if(e.error){
            toast.error(e.error);
            return;
       }
      toast.error('Failed to update profile');
    }
  });
};

const handleUpdatePassword = (e: React.FormEvent) => {
  e.preventDefault();
  postPassword('/customer/password/update', {
    onSuccess: () => {
      toast.success('Password updated successfully');
      resetPassword();
      setProfileTab('info');
    },
    onError: (e) => {
         if(e.error){
            toast.error(e.error);
            return;
       }
      toast.error('Failed to update password');
    }
  });
};

  const currentCard = cardTemplates[currentCardIndex];

  // Calculate stamps for current card
  const currentCardStamps = useMemo(() => {
    if (!stampCodes || !currentCard) return [];
    return stampCodes.filter(stamp => stamp.loyalty_card_id === currentCard.id);
  }, [stampCodes, currentCard]);

  const totalStamps = currentCardStamps?.length || 0;

  // Get perks/rewards for current card
  const currentCardPerks = useMemo(() => {
    return currentCard != undefined ? currentCard?.perks : [];
  }, [currentCard]);

  // Navigate cards
  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cardTemplates.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cardTemplates.length) % cardTemplates.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatCompletedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const handleRecordStamp = () => {
    setMethodDialogOpen(true);
  };

  const handleManualEntry = () => {
    setMethodDialogOpen(false);
    setRecordDialogOpen(true);
    setData('loyalty_card_id', currentCard?.id);
  };

const handleScanQR = async () => {
  setMethodDialogOpen(false);
  setScanDialogOpen(true);
  setScanning(true);
  
  // Wait a bit for dialog to open and video element to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    const codeReader = new BrowserQRCodeReader();
    
    // Check if video element is ready
    if (!videoRef.current) {
      throw new Error('Video element not ready');
    }
    
    const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
    
    if (videoInputDevices.length === 0) {
      throw new Error('No camera devices found');
    }
    
    // Find back camera (environment) or use last device (usually back camera on mobile)
    let selectedDeviceId;
    
    // On mobile, the back camera is often the last device
    const backCamera = videoInputDevices.find(device => 
      device.label.toLowerCase().includes('back') || 
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    );
    
    selectedDeviceId = backCamera?.deviceId || videoInputDevices[videoInputDevices.length - 1]?.deviceId;
    
    
    const controls = await codeReader.decodeFromVideoDevice(
      selectedDeviceId, 
      videoRef.current,
      (result, error, controls) => {
        controlsRef.current = controls;
        
        if (result) {
          const scannedCode = result.text;
          data.loyalty_card_id = scannedCode;

          
          router.post('/stamps/record', {
            loyalty_card_id: currentCard?.id,
            code: scannedCode
          }, {
            onSuccess: (page) => {
              const index = cardTemplates.findIndex(card => card.id === page.props.flash.active_card_id);
              if (index !== -1) {
                setCurrentCardIndex(index);
              }
        
              if (page.props.flash.card_completed) {
                toast.success(`🎉 ${page.props.flash.message}`, {
                  description: `You completed cycle #${page.props.flash.cycle_number}!`
                });
              } else {
                toast.success("Stamped Successfully.");
              }
              
              // Clean up
              if (controlsRef.current) {
                controlsRef.current.stop();
              }
              setScanDialogOpen(false);
              setScanning(false);
              reset();
            },
            onError: (errors) => {
              if (errors.code) {
                toast.error(errors.code);
              } else {
                toast.error('Failed to record stamp. Please try again.');
              }
              
              // Clean up
              if (controlsRef.current) {
                controlsRef.current.stop();
              }
              setScanDialogOpen(false);
              setScanning(false);
            },
            onFinish: () => {
              if (controlsRef.current) {
                controlsRef.current.stop();
              }
              stopCamera();
            }
          });
        }
      }
    );
    
    controlsRef.current = controls;
    
  } catch (err) {
    console.error('Camera error:', err);
    
    // More specific error messages
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      toast.error('Camera permission denied. Please allow camera access in your browser settings.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      toast.error('No camera found on this device.');
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      toast.error('Camera is already in use by another application.');
    } else {
      toast.error('Failed to access camera. Please try again.');
    }
    
    setScanDialogOpen(false);
    setScanning(false);
  }
};

  const stopCamera = () => {
      if (controlsRef.current) {
    try {
      controlsRef.current.stop();
    } catch (error) {
      console.error('Error stopping controls:', error);
    }
    controlsRef.current = null;
  }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setScanDialogOpen(false);
  };

    useEffect(() => {
  return () => {
    stopCamera();
  };
}, []);

useEffect(() => {
  if(!scanDialogOpen){
    stopCamera();
  }
},[scanDialogOpen])

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();

    post('/stamps/record', {
      onSuccess: (page) => {
        const index = cardTemplates.findIndex(card => card.id === page.props.flash.active_card_id);
        if (index !== -1) {
          setCurrentCardIndex(index);
        }

        
        // Show success message based on completion status
        if (page.props.flash.card_completed) {
          toast.success(`🎉 ${page.props.flash.message}`, {
            description: `You completed cycle #${page.props.flash.cycle_number}!`
          });
        } else {
          toast.success("Stamped Succesfully.");
        }
        
        reset();
        setRecordDialogOpen(false);
      },
      onError: (errors) => {
        if (errors.code) {
          toast.error(errors.code);
        } else {
          toast.error('Failed to record stamp. Please try again.');
        }
      }
    });

    
  };



  const StampShape = ({ shape, isFilled, isReward, rewardText, color, stampImage }: {
    shape: string;
    isFilled: boolean;
    isReward: boolean;
    rewardText?: string;
    color: string;
    stampImage: any
  }) => {
    const fillColor = isFilled ? (currentCard.stampFilledColor || color) : currentCard.stampEmptyColor;
    const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';
    let stampImageUrl = currentCard.stampImage ? `/${currentCard.stampImage}` : null;

    if(stampImage){
      stampImageUrl = `/${stampImage}`;
    }

    const shapes: Record<string, JSX.Element> = {
      circle: (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            {stampImageUrl && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={stampImageUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <circle cx="50" cy="50" r="45" fill={stampImageUrl && isFilled ? "url(#stampPattern)" : fillColor} stroke={strokeColor} strokeWidth="2" />
        </svg>
      ),
      star: (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            {stampImageUrl && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={stampImageUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
            fill={stampImageUrl && isFilled ? "url(#stampPattern)" : fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      ),
      square: (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            {stampImageUrl && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={stampImageUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <rect x="10" y="10" width="80" height="80" rx="12" fill={stampImageUrl && isFilled ? "url(#stampPattern)" : fillColor} stroke={strokeColor} strokeWidth="2" />
        </svg>
      ),
      hexagon: (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            {stampImageUrl && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={stampImageUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill={stampImageUrl && isFilled ? "url(#stampPattern)" : fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      )
    };

    return (
      <div className="relative w-full h-full">
        {shapes[shape]}
        {isReward && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-[8px] text-center px-1 leading-tight drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {rewardText}
            </span>
          </div>
        )}
        {isFilled && !isReward && !stampImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  const getPerkForStamp = (stampNumber: number) => {
    return currentCardPerks.find(p => p.stampNumber === stampNumber);
  };

  const CompletedCardPreview = ({ completed }: { completed: CompletedCard }) => {
    const cardTemplate = cardTemplates.find(c => c.id === completed.loyalty_card_id);

    
    if (!cardTemplate) return null;

    const logoUrl = cardTemplate.logo ? `/${cardTemplate.logo}` : null;
    const backgroundImageUrl = cardTemplate.backgroundImage ? `/${cardTemplate.backgroundImage}` : null;

    
    return (
      <div 
        className="rounded-lg shadow-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setSelectedCompletedCard(completed)}
      >
        <div
          className="p-6 min-h-full flex items-center justify-center"
          style={{
            backgroundColor: cardTemplate.backgroundColor,
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="backdrop-blur-sm p-3 rounded-lg" style={{ backgroundColor: backgroundImageUrl ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
            {/* Logo */}
            {logoUrl && (
              <div className="flex justify-center mb-3">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 w-12 object-cover rounded-full border-2 border-white shadow-xl" 
                />
              </div>
            )}

            {/* Header with Trophy */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 
                  className="font-bold text-lg tracking-wide"
                  style={{ color: cardTemplate.textColor }}
                >
                  {cardTemplate.heading}
                </h3>
                <p 
                  className="text-xs opacity-90"
                  style={{ color: cardTemplate.textColor }}
                >
                  Cycle #{completed.card_cycle}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
            </div>
            
            {/* Completion Info */}
            <div className="bg-white/95 backdrop-blur rounded-lg p-3 mb-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 text-xs">{formatCompletedDate(completed.completed_at)}</span>
              </div>
            </div>

            {/* Stamps Grid - matching active card style */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: completed.stamps_collected }).map((_, index) => {
                const stampNumber = index + 1;
                const perk = cardTemplate.perks?.find(p => p.stampNumber === stampNumber);
                
                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10">
                      <StampShape
                        shape={cardTemplate.stampShape}
                        isFilled={true}
                        isReward={!!perk}
                        rewardText={perk?.reward}
                        color={perk ? perk.color : cardTemplate.stampColor}
                        stampImage={cardTemplate.stampImage}

                      />
                    </div>
                    <span className="text-[9px] font-medium" style={{ color: cardTemplate.textColor }}>
                      {stampNumber}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t mt-4 pt-2" style={{ borderColor: cardTemplate.textColor + '40' }}>
              <p
                className="text-center text-[9px] opacity-90 font-medium"
                style={{ color: cardTemplate.textColor }}
              >
                {cardTemplate.footer}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const logoUrl = currentCard?.logo ? `/${currentCard.logo}` : null;
  const backgroundImageUrl = currentCard?.backgroundImage ? `/${currentCard.backgroundImage}` : null;

  if (!cardTemplates || cardTemplates.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="rounded-xl flex items-center justify-center">
                 <img src={LOGO} alt="business logo" className='h-12'/>
              </div>
              <nav className="flex gap-8">
                <button className="text-black font-semibold border-b-2 border-black pb-1">
                  Home
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
  Profile
</DropdownMenuItem>

                    <DropdownMenuItem onClick={() => router.post('/customer/logout')}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-bold text-primary mb-8 sm:text-4xl text-xl">{customerName} 👋</h1>
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No loyalty cards available yet.</p>
            </CardContent>
          </Card>
        </main>

        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>My Profile</DialogTitle>
      <DialogDescription>
        Update your account information
      </DialogDescription>
    </DialogHeader>
    
    <Tabs value={profileTab} onValueChange={setProfileTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Account Info</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4 mt-4">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={(e) => setProfileData('username', e.target.value)}
              placeholder="Enter username"
            />
            {profileErrors.username && (
              <p className="text-sm text-destructive">{profileErrors.username}</p>
            )}
          </div>
          
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProfileDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={profileProcessing}>
              {profileProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </TabsContent>
      
      <TabsContent value="password" className="space-y-4 mt-4">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData('current_password', e.target.value)}
              placeholder="Enter current password"
            />
            {passwordErrors.current_password && (
              <p className="text-sm text-destructive">{passwordErrors.current_password}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData('password', e.target.value)}
              placeholder="Enter new password"
            />
            {passwordErrors.password && (
              <p className="text-sm text-destructive">{passwordErrors.password}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm New Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
              placeholder="Confirm new password"
            />
            {passwordErrors.password_confirmation && (
              <p className="text-sm text-destructive">{passwordErrors.password_confirmation}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProfileTab('info');
                resetPassword();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={passwordProcessing}>
              {passwordProcessing ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
         {/* Profile Dialog */}
<Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>My Profile</DialogTitle>
      <DialogDescription>
        Update your account information
      </DialogDescription>
    </DialogHeader>
    
    <Tabs value={profileTab} onValueChange={setProfileTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Account Info</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4 mt-4">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={(e) => setProfileData('username', e.target.value)}
              placeholder="Enter username"
            />
            {profileErrors.username && (
              <p className="text-sm text-destructive">{profileErrors.username}</p>
            )}
          </div>

          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProfileDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={profileProcessing}>
              {profileProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </TabsContent>
      
      <TabsContent value="password" className="space-y-4 mt-4">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData('current_password', e.target.value)}
              placeholder="Enter current password"
            />
            {passwordErrors.current_password && (
              <p className="text-sm text-destructive">{passwordErrors.current_password}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData('password', e.target.value)}
              placeholder="Enter new password"
            />
            {passwordErrors.password && (
              <p className="text-sm text-destructive">{passwordErrors.password}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm New Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
              placeholder="Confirm new password"
            />
            {passwordErrors.password_confirmation && (
              <p className="text-sm text-destructive">{passwordErrors.password_confirmation}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProfileTab('info');
                resetPassword();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={passwordProcessing}>
              {passwordProcessing ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
           <div className="rounded-xl flex items-center justify-center">
                 <img src={LOGO} alt="business logo" className='h-12'/>
              </div>
            <nav className="hidden sm:flex gap-8">
              <button className="text-primary font-semibold border-b-2 border-primary pb-1">
                Home
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleRecordStamp}
              className="bg-primary text-white hover:bg-primary/70"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Record Stamp</span>
            </Button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
  Profile
</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.post('/customer/logout')}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="sm:text-4xl text-xl font-bold text-primary mb-8">
          {customerName} 👋
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="home">Active Cards</TabsTrigger>
              <TabsTrigger value="perks" className="flex items-center gap-2">
    <Award className="w-4 h-4" />
    My Perks ({perkClaims.length})
  </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              History ({completedCards.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Cards Tab */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Loyalty Card with Carousel */}
              <Card className="lg:col-span-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="sm:text-lg text-sm font-semibold flex items-center gap-3">{currentCard.name.toUpperCase()}</CardTitle>
                  {cardTemplates.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevCard}
                        className="sm:h-8 sm:w-8 sm:p-0 size-4"
                      >
                        <ChevronLeft className="sm:h-4 sm:w-4" />
                      </Button>
                      <span className="sm:text-sm text-gray-500 text-xs">
                        {currentCardIndex + 1} / {cardTemplates.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextCard}
                        className="sm:h-8 sm:w-8 sm:p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-black mb-1">
                      {totalStamps} <span className="text-gray-400">/ {currentCard.stampsNeeded}</span>
                    </div>
                    <div className="text-sm text-gray-500">Total Stamps Accumulated</div>
                    
                    {totalStamps === currentCard.stampsNeeded && (
                      <Badge className="mt-3 bg-green-500 text-white hover:bg-green-600">
                        🎉 Card Complete! Ready for rewards
                      </Badge>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-black to-gray-700 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(totalStamps / currentCard.stampsNeeded) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* The Loyalty Card */}
                  <div
                    className="rounded-lg shadow-2xl overflow-hidden"
                    style={{
                      backgroundColor: currentCard.backgroundColor,
                      backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="p-6 backdrop-blur-sm" style={{ backgroundColor: backgroundImageUrl ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                      {/* Logo */}
                      {logoUrl && (
                        <div className="flex justify-center mb-4">
                          <img 
                            src={logoUrl} 
                            alt="Logo" 
                            className="h-16 w-16 object-cover rounded-full border-3 border-white shadow-xl" 
                          />
                        </div>
                      )}

                      {/* Heading */}
                      <h3
                        className="text-xl font-bold text-center mb-1 tracking-wider"
                        style={{ color: currentCard.textColor }}
                      >
                        {currentCard.heading}
                      </h3>

                      {/* Subheading */}
                      <p
                        className="text-center text-xs mb-5 opacity-90"
                        style={{ color: currentCard.textColor }}
                      >
                        {currentCard.subheading}
                      </p>

                      {/* Stamps Grid */}
                      <div className="grid grid-cols-5 gap-2 mb-4"> 
                        {Array.from({ length: currentCard.stampsNeeded }).map((_, index) => {
                          const stampNumber = index + 1;
                          const perk = getPerkForStamp(stampNumber);
                          const isFilled = index < totalStamps;
                          
                          return (
                            <div key={index} className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10">
                                <StampShape
                                  shape={currentCard.stampShape}
                                  isFilled={isFilled}
                                  isReward={!!perk}
                                  rewardText={perk?.reward}
                                  color={perk ? perk.color : currentCard.stampColor}
                                />
                              </div>
                              <span className="text-[9px] font-medium" style={{ color: currentCard.textColor }}>
                                {stampNumber}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mechanics */}
                      <div className="bg-white/95 backdrop-blur rounded-lg p-3 mb-3 shadow-lg">
                        <p className="text-[10px] text-gray-800 text-center leading-relaxed">
                          {currentCard.mechanics}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="border-t pt-2" style={{ borderColor: currentCard.textColor + '40' }}>
                        <p
                          className="text-center text-[9px] opacity-90 font-medium"
                          style={{ color: currentCard.textColor }}
                        >
                          {currentCard.footer}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Stamps for Current Card */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Stamps</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {currentCardStamps.length > 0 ? (
                    <div className="space-y-4">
                      {currentCardStamps.map((stamp) => (
                        <div key={stamp.id} className="flex items-center gap-3 border-b pb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-5 h-5 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-black">{currentCard.name}</div>
                            <div className="text-xs text-gray-700">{formatDate(stamp.used_at)}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs mb-1 bg-green-100 text-green-800 hover:bg-green-100">
                              Success
                            </Badge>
                            <div className="text-xs text-gray-500">1 Stamp</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-gray-500">No stamps collected yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Awards Awaiting for Current Card */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Awards Awaiting</h2>
            </div>

            <Card className="border-gray-200">
              <CardContent className="space-y-4">
                {currentCardPerks.length > 0 ? (
                  currentCardPerks.map((perk) => (
                    <div key={perk.id} className="flex flex-col items-start md:items-center md:flex-row border-b gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer">
                      <div 
                        className="md:w-12 md:h-12 size-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                        style={{ backgroundColor: perk.color }}
                      >
                        {perk.stampNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold sm:text-base text-sm text-black">{perk.reward}</h3>
                        <p className="text-xs text-gray-500">Unlock at {perk.stampNumber} stamps</p>
                        {perk.details && (
                          <p className="md:text-sm text-xs text-gray-600 mt-1">{perk.details}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span className="md:text-2xl text-lg font-bold text-black">{perk.stampNumber}</span>
                          <span className="md:text-sm text-xs text-gray-500">Stamps</span>
                        </div>
                        {totalStamps >= perk.stampNumber && (
                          <Badge className="mt-2 bg-green-500 text-white hover:bg-green-600">
                            Unlocked!
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No rewards available for this card</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perks Tab */}
<TabsContent value="perks" className="space-y-6">
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-gray-900">My Rewards</h2>
    <p className="text-gray-500 mt-1">View and manage your unlocked rewards</p>
  </div>

  {perkClaims.length > 0 ? (
    <div className="grid gap-4">
      {perkClaims.map((claim) => (
        <Card key={claim.id} className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {claim.loyalty_card.logo ? (
                  <img 
                    src={`/${claim.loyalty_card.logo}`}
                    alt={claim.loyalty_card.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {claim.perk.reward}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {claim.loyalty_card.name}
                    </p>
                  </div>
                  {claim.is_redeemed ? (
                    <Badge className="bg-gray-500 text-white hover:bg-gray-600">
                      Redeemed
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white hover:bg-green-600">
                      Available
                    </Badge>
                  )}
                </div>

                {claim.perk.details && (
                  <p className="text-sm text-gray-600 mb-3">
                    {claim.perk.details}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Unlocked with {claim.stamps_at_claim} stamps</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Claimed {formatDate(claim.created_at)}</span>
                  </div>
                  {claim.is_redeemed && claim.redeemed_at && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>Redeemed {formatDate(claim.redeemed_at)}</span>
                    </div>
                  )}
                </div>

                {claim.remarks && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Note:</span> {claim.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <Card className="border-gray-200">
      <CardContent className="p-12 text-center">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Yet</h3>
        <p className="text-gray-500">
          Keep collecting stamps to unlock exciting rewards!
        </p>
      </CardContent>
    </Card>
  )}
</TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Completed Cards</h2>
              <p className="text-gray-500 mt-1">Your achievement history - {completedCards.length} cards completed</p>
            </div>

            {completedCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCards.map((completed) => (
                  <CompletedCardPreview key={completed.id} completed={completed} />
                ))}
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Cards Yet</h3>
                  <p className="text-gray-500">Complete your first card to see it here!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Method Selection Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Stamp</DialogTitle>
            <DialogDescription>
              Choose how you want to record your stamp
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={handleScanQR}
              className="h-32 flex flex-col gap-3"
              variant="outline"
            >
              <Camera className="w-8 h-8" />
              <span>Scan QR Code</span>
            </Button>
            <Button
              onClick={handleManualEntry}
              className="h-32 flex flex-col gap-3"
              variant="outline"
            >
              <Type className="w-8 h-8" />
              <span>Enter Manually</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Stamp Code</DialogTitle>
            <DialogDescription>
              Enter the code provided by the business
            </DialogDescription>
          </DialogHeader>
          <div onSubmit={handleSubmitCode}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Stamp Code</Label>
                <Input
                  id="code"
                  placeholder="Enter code here"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  className="uppercase"
                  required
                />
                {errors.code && (
                  <div className="text-xs text-destructive">{errors.code}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRecordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCode} disabled={processing}>
                {processing ? 'Recording...' : 'Record Stamp'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

   {/* QR Scanner Dialog */}
    <Dialog open={scanDialogOpen} onOpenChange={(open) => {
      if (!open) stopCamera();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code within the frame
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white rounded-lg shadow-lg">
                  {/* Scanning corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg inline-block">
                    Scanning for QR code...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>


      {/* Completed Card Detail Dialog */}
      <Dialog open={!!selectedCompletedCard} onOpenChange={() => setSelectedCompletedCard(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Completed Card Details
            </DialogTitle>
          </DialogHeader>
          {selectedCompletedCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Loyalty Card</p>
                  <p className="font-semibold">{selectedCompletedCard.loyalty_card_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cycle Number</p>
                  <p className="font-semibold">#{selectedCompletedCard.card_cycle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stamps Collected</p>
                  <p className="font-semibold">{selectedCompletedCard.stamps_collected}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed On</p>
                  <p className="font-semibold">{formatCompletedDate(selectedCompletedCard.completed_at)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Stamp History</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {JSON.parse(selectedCompletedCard.stamps_data).map((stamp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="font-mono text-gray-600">{stamp.code}</span>
                      <span className="text-gray-500 text-xs">{formatDate(stamp.used_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

   

    </div>
  );
}