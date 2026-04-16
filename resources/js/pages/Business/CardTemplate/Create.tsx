import { useState } from 'react';
import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { Upload, ImageIcon, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/multi-select';
import { MapPin } from 'lucide-react';
export default function Create({ branches = [] }: { branches?: { id: number; name: string }[] }) {
  const { data, setData, post, processing, errors } = useForm({
      logo: null,
      name: '',
      heading: 'LOYALTY CARD',
      subheading: 'Collect stamps and earn rewards!',
      stampsNeeded: 10,
      mechanics: 'Get 1 stamp per purchase. Collect stamps to unlock rewards!',
      backgroundColor: '#4DB6AC',
      valid_until: '',
      textColor: '#FFFFFF',
      stampColor: '#4DB6AC',
      stampFilledColor: '#FF6B6B',
      stampEmptyColor: '#E5E7EB',
      stampImage: null,
      backgroundImage: null,
      footer: 'your social media • your website',
      stampShape: 'star',
      perks: [
          {
              stampNumber: 5,
              reward: '10% OFF',
              color: '#FF6B6B',
              details: 'Get 10% discount on your next purchase',
          },
          {
              stampNumber: 10,
              reward: 'FREE ITEM',
              color: '#3F51B5',
              details: 'Choose any item from our menu for free!',
          },
      ],
      branch_ids: [] as number[],
  });

  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPerk = () => {
    setData('perks', [...data.perks, { stampNumber: 1, reward: '', color: '#FF6B6B', details: '' }]);
  };

  const updatePerk = (index, field, value) => {
    const updatedPerks = data.perks.map((perk, i) => 
      i === index ? { ...perk, [field]: value } : perk
    );
    setData('perks', updatedPerks);
  };

  const removePerk = (index) => {
    setData('perks', data.perks.filter((_, i) => i !== index));
  };

  const getPerkForStamp = (stampNumber) => {
    return data.perks.find(p => p.stampNumber === stampNumber);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/business/card-templates', {
      onSuccess: () => {
        toast.success('Loyalty Card Created Successfully.');
      },
      onError: (e) => {
          if(e.error){
            toast.error(e.error);
            return;
          }
        toast.error("Please fill up all the required fields");
      }
    });
  };

  const StampShape = ({ shape, isFilled, isReward, rewardText, color, details }) => {
    const fillColor = isFilled ? (data.stampFilledColor || color) : data.stampEmptyColor;
    const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';

    const shapes = {
      circle: (
        <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-300 hover:scale-110 w-full h-full">
          <defs>
            {data.stampImage && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={data.stampImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <circle cx="50" cy="50" r="45" fill={data.stampImage && isFilled ? "url(#stampPattern)" : fillColor} stroke={strokeColor} strokeWidth="3" />
        </svg>
      ),
      star: (
        <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-300 hover:scale-110 w-full h-full">
          <defs>
            {data.stampImage && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={data.stampImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
            fill={data.stampImage && isFilled ? "url(#stampPattern)" : fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      ),
      square: (
        <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-300 hover:scale-110 w-full h-full">
          <defs>
            {data.stampImage && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={data.stampImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <rect x="10" y="10" width="80" height="80" rx="12" fill={data.stampImage && isFilled ? "url(#stampPattern)" : fillColor} stroke={strokeColor} strokeWidth="3" />
        </svg>
      ),
      hexagon: (
        <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-300 hover:scale-110 w-full h-full">
          <defs>
            {data.stampImage && (
              <pattern id="stampPattern" x="0" y="0" width="1" height="1">
                <image href={data.stampImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill={data.stampImage && isFilled ? "url(#stampPattern)" : fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      )
    };

    return (
      <div className="relative group">
        {shapes[shape]}
        {isReward && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-[10px] text-center px-1 leading-tight drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {rewardText}
            </span>
          </div>
        )}
        {isFilled && !isReward && !data.stampImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
        )}
        {/* Hover Tooltip for Details */}
        {isReward && details && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap max-w-[200px] text-center">
              <div className="font-bold mb-1">{rewardText}</div>
              <div className="text-gray-300">{details}</div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
      <AppLayout>
          <Head title="Create Card Template" />
          <ModuleHeading
              title="Create your customized card template"
              description="Design your loyalty card with live preview and custom rewards"
          />

          <form onSubmit={handleSubmit}>
              <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 lg:mt-8 lg:grid-cols-5 lg:gap-8">
                  {/* Form Section - 3 columns */}
                  <div className="space-y-4 md:space-y-6 lg:col-span-3">
                      <Tabs defaultValue="design" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger
                                  value="design"
                                  className="text-xs sm:text-sm"
                              >
                                  Design
                              </TabsTrigger>
                              <TabsTrigger
                                  value="perks"
                                  className="text-xs sm:text-sm"
                              >
                                  Perks
                              </TabsTrigger>
                              <TabsTrigger
                                  value="details"
                                  className="text-xs sm:text-sm"
                              >
                                  Details
                              </TabsTrigger>
                              <TabsTrigger
                                  value="branches"
                                  className="text-xs sm:text-sm"
                              >
                                  Branches
                              </TabsTrigger>
                          </TabsList>

                          {/* Design Tab */}
                          <TabsContent
                              value="design"
                              className="space-y-4 md:space-y-6"
                          >
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg md:text-xl">
                                          Visual Design
                                      </CardTitle>
                                      <CardDescription className="text-xs md:text-sm">
                                          Customize the appearance of your
                                          loyalty card
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4 md:space-y-6">
                                      {/* Logo Upload */}
                                      {/* <div className="space-y-2">
                      <Label className="text-sm md:text-base">Card Logo</Label>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="relative text-xs md:text-sm">
                          <Upload className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('logo', e)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </Button>
                        {data.logo && (
                          <div className="relative">
                            <img src={data.logo} alt="Logo" className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg ring-2 ring-primary" />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5 md:h-6 md:w-6"
                              onClick={() => setData('logo', null)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {errors.logo && <p className="text-xs md:text-sm text-red-500">{errors.logo}</p>}
                    </div> */}

                                      {/* Background Image */}
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Background Image (Optional)
                                          </Label>
                                          <div className="flex items-center gap-4">
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  className="relative text-xs md:text-sm"
                                              >
                                                  <ImageIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                  Upload Background
                                                  <input
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={(e) =>
                                                          handleImageUpload(
                                                              'backgroundImage',
                                                              e,
                                                          )
                                                      }
                                                      className="absolute inset-0 cursor-pointer opacity-0"
                                                  />
                                              </Button>
                                              {data.backgroundImage && (
                                                  <Button
                                                      type="button"
                                                      variant="destructive"
                                                      size="sm"
                                                      onClick={() =>
                                                          setData(
                                                              'backgroundImage',
                                                              null,
                                                          )
                                                      }
                                                      className="text-xs md:text-sm"
                                                  >
                                                      Remove
                                                  </Button>
                                              )}
                                          </div>
                                          {errors.backgroundImage && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.backgroundImage}
                                              </p>
                                          )}
                                      </div>

                                      {/* Stamp Shape */}
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Stamp Shape
                                          </Label>
                                          <Select
                                              value={data.stampShape}
                                              onValueChange={(value) =>
                                                  setData('stampShape', value)
                                              }
                                          >
                                              <SelectTrigger className="text-xs md:text-sm">
                                                  <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="star">
                                                      Star
                                                  </SelectItem>
                                                  <SelectItem value="circle">
                                                      Circle
                                                  </SelectItem>
                                                  <SelectItem value="square">
                                                      Square
                                                  </SelectItem>
                                                  <SelectItem value="hexagon">
                                                      Hexagon
                                                  </SelectItem>
                                              </SelectContent>
                                          </Select>
                                          {errors.stampShape && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.stampShape}
                                              </p>
                                          )}
                                      </div>

                                      {/* Color Pickers */}
                                      <div className="grid gap-4 sm:grid-cols-2">
                                          <div className="space-y-2">
                                              <Label className="text-sm md:text-base">
                                                  Background Color
                                              </Label>
                                              <div className="flex gap-2">
                                                  <Input
                                                      type="color"
                                                      value={
                                                          data.backgroundColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'backgroundColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="h-10 w-16 cursor-pointer md:w-20"
                                                  />
                                                  <Input
                                                      type="text"
                                                      value={
                                                          data.backgroundColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'backgroundColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="flex-1 text-xs md:text-sm"
                                                  />
                                              </div>
                                              {errors.backgroundColor && (
                                                  <p className="text-xs text-red-500 md:text-sm">
                                                      {errors.backgroundColor}
                                                  </p>
                                              )}
                                          </div>
                                          <div className="space-y-2">
                                              <Label className="text-sm md:text-base">
                                                  Text Color
                                              </Label>
                                              <div className="flex gap-2">
                                                  <Input
                                                      type="color"
                                                      value={data.textColor}
                                                      onChange={(e) =>
                                                          setData(
                                                              'textColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="h-10 w-16 cursor-pointer md:w-20"
                                                  />
                                                  <Input
                                                      type="text"
                                                      value={data.textColor}
                                                      onChange={(e) =>
                                                          setData(
                                                              'textColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="flex-1 text-xs md:text-sm"
                                                  />
                                              </div>
                                              {errors.textColor && (
                                                  <p className="text-xs text-red-500 md:text-sm">
                                                      {errors.textColor}
                                                  </p>
                                              )}
                                          </div>
                                          <div className="space-y-2">
                                              <Label className="text-sm md:text-base">
                                                  Stamp Filled Color
                                              </Label>
                                              <div className="flex gap-2">
                                                  <Input
                                                      type="color"
                                                      value={
                                                          data.stampFilledColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'stampFilledColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="h-10 w-16 cursor-pointer md:w-20"
                                                  />
                                                  <Input
                                                      type="text"
                                                      value={
                                                          data.stampFilledColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'stampFilledColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="flex-1 text-xs md:text-sm"
                                                  />
                                              </div>
                                              {errors.stampFilledColor && (
                                                  <p className="text-xs text-red-500 md:text-sm">
                                                      {errors.stampFilledColor}
                                                  </p>
                                              )}
                                          </div>
                                          <div className="space-y-2">
                                              <Label className="text-sm md:text-base">
                                                  Stamp Empty Color
                                              </Label>
                                              <div className="flex gap-2">
                                                  <Input
                                                      type="color"
                                                      value={
                                                          data.stampEmptyColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'stampEmptyColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="h-10 w-16 cursor-pointer md:w-20"
                                                  />
                                                  <Input
                                                      type="text"
                                                      value={
                                                          data.stampEmptyColor
                                                      }
                                                      onChange={(e) =>
                                                          setData(
                                                              'stampEmptyColor',
                                                              e.target.value,
                                                          )
                                                      }
                                                      className="flex-1 text-xs md:text-sm"
                                                  />
                                              </div>
                                              {errors.stampEmptyColor && (
                                                  <p className="text-xs text-red-500 md:text-sm">
                                                      {errors.stampEmptyColor}
                                                  </p>
                                              )}
                                          </div>
                                      </div>

                                      {/* Stamp Image Upload */}
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Stamp Image (Optional)
                                          </Label>
                                          <p className="text-xs text-gray-500">
                                              Upload an image to fill the stamps
                                              when completed. Overrides stamp
                                              colors.
                                          </p>
                                          <div className="flex items-center gap-4">
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  className="relative text-xs md:text-sm"
                                              >
                                                  <ImageIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                  Upload Stamp Image
                                                  <input
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={(e) =>
                                                          handleImageUpload(
                                                              'stampImage',
                                                              e,
                                                          )
                                                      }
                                                      className="absolute inset-0 cursor-pointer opacity-0"
                                                  />
                                              </Button>
                                              {data.stampImage && (
                                                  <div className="flex items-center gap-2">
                                                      <img
                                                          src={data.stampImage}
                                                          alt="Stamp"
                                                          className="h-12 w-12 rounded-lg object-cover ring-2 ring-primary md:h-16 md:w-16"
                                                      />
                                                      <Button
                                                          type="button"
                                                          variant="destructive"
                                                          size="sm"
                                                          onClick={() =>
                                                              setData(
                                                                  'stampImage',
                                                                  null,
                                                              )
                                                          }
                                                          className="text-xs md:text-sm"
                                                      >
                                                          Remove
                                                      </Button>
                                                  </div>
                                              )}
                                          </div>
                                          {errors.stampImage && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.stampImage}
                                              </p>
                                          )}
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>

                          {/* Perks Tab */}
                          <TabsContent
                              value="perks"
                              className="space-y-4 md:space-y-6"
                          >
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg md:text-xl">
                                          Rewards Configuration
                                      </CardTitle>
                                      <CardDescription className="text-xs md:text-sm">
                                          Set up rewards at specific stamp
                                          milestones
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Total Stamps Needed
                                          </Label>
                                          <Input
                                              type="number"
                                              min="2"
                                              max="20"
                                              value={data.stampsNeeded}
                                              onChange={(e) =>
                                                  setData(
                                                      'stampsNeeded',
                                                      parseInt(e.target.value),
                                                  )
                                              }
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.stampsNeeded && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.stampsNeeded}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                              <Label className="text-sm md:text-base">
                                                  Reward Milestones
                                              </Label>
                                              <Button
                                                  type="button"
                                                  onClick={addPerk}
                                                  size="sm"
                                                  className="text-xs md:text-sm"
                                              >
                                                  <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                  Add Perk
                                              </Button>
                                          </div>

                                          {data.perks.map((perk, index) => (
                                              <Card
                                                  key={index}
                                                  className="border-2"
                                              >
                                                  <CardContent className="pt-4 md:pt-6">
                                                      <div className="grid grid-cols-12 items-end gap-2 md:gap-4">
                                                          <div className="col-span-3">
                                                              <Label className="text-xs md:text-sm">
                                                                  Stamp #
                                                              </Label>
                                                              <Input
                                                                  type="number"
                                                                  min="1"
                                                                  max={
                                                                      data.stampsNeeded
                                                                  }
                                                                  value={
                                                                      perk.stampNumber
                                                                  }
                                                                  onChange={(
                                                                      e,
                                                                  ) =>
                                                                      updatePerk(
                                                                          index,
                                                                          'stampNumber',
                                                                          parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                      )
                                                                  }
                                                                  className="text-xs md:text-sm"
                                                              />
                                                          </div>
                                                          <div className="col-span-5">
                                                              <Label className="text-xs md:text-sm">
                                                                  Reward
                                                              </Label>
                                                              <Input
                                                                  type="text"
                                                                  placeholder="10% OFF"
                                                                  value={
                                                                      perk.reward
                                                                  }
                                                                  onChange={(
                                                                      e,
                                                                  ) =>
                                                                      updatePerk(
                                                                          index,
                                                                          'reward',
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                  }
                                                                  className="text-xs md:text-sm"
                                                              />
                                                          </div>
                                                          <div className="col-span-3">
                                                              <Label className="text-xs md:text-sm">
                                                                  Color
                                                              </Label>
                                                              <Input
                                                                  type="color"
                                                                  value={
                                                                      perk.color
                                                                  }
                                                                  onChange={(
                                                                      e,
                                                                  ) =>
                                                                      updatePerk(
                                                                          index,
                                                                          'color',
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                  }
                                                                  className="h-9 cursor-pointer md:h-10"
                                                              />
                                                          </div>
                                                          <div className="col-span-1">
                                                              <Button
                                                                  type="button"
                                                                  variant="destructive"
                                                                  size="icon"
                                                                  onClick={() =>
                                                                      removePerk(
                                                                          index,
                                                                      )
                                                                  }
                                                                  className="h-9 w-9 md:h-10 md:w-10"
                                                              >
                                                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                                              </Button>
                                                          </div>
                                                      </div>
                                                      {/* Perk Details Field */}
                                                      <div className="mt-3 md:mt-4">
                                                          <Label className="text-xs md:text-sm">
                                                              Perk Details
                                                          </Label>
                                                          <Textarea
                                                              placeholder="e.g., Get 10% discount on your next purchase"
                                                              value={
                                                                  perk.details
                                                              }
                                                              onChange={(e) =>
                                                                  updatePerk(
                                                                      index,
                                                                      'details',
                                                                      e.target
                                                                          .value,
                                                                  )
                                                              }
                                                              rows={2}
                                                              className="mt-1 text-xs md:text-sm"
                                                          />
                                                      </div>
                                                  </CardContent>
                                              </Card>
                                          ))}

                                          {data.perks.length === 0 && (
                                              <Alert>
                                                  <AlertDescription className="text-xs md:text-sm">
                                                      No reward milestones set.
                                                      Click "Add Perk" to create
                                                      rewards at specific
                                                      stamps.
                                                  </AlertDescription>
                                              </Alert>
                                          )}
                                          {errors.perks && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.perks}
                                              </p>
                                          )}
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>

                          {/* Details Tab */}
                          <TabsContent
                              value="details"
                              className="space-y-4 md:space-y-6"
                          >
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg md:text-xl">
                                          Card Information
                                      </CardTitle>
                                      <CardDescription className="text-xs md:text-sm">
                                          Add text content and details
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4 md:space-y-6">
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Card Name
                                          </Label>
                                          <Input
                                              type="text"
                                              value={data.name}
                                              onChange={(e) =>
                                                  setData(
                                                      'name',
                                                      e.target.value,
                                                  )
                                              }
                                              placeholder="This going to be the unique name of the card template"
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.name && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.name}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Card Heading
                                          </Label>
                                          <Input
                                              type="text"
                                              value={data.heading}
                                              onChange={(e) =>
                                                  setData(
                                                      'heading',
                                                      e.target.value,
                                                  )
                                              }
                                              placeholder="LOYALTY CARD"
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.heading && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.heading}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Card Subheading
                                          </Label>
                                          <Input
                                              type="text"
                                              value={data.subheading}
                                              onChange={(e) =>
                                                  setData(
                                                      'subheading',
                                                      e.target.value,
                                                  )
                                              }
                                              placeholder="Collect stamps and earn rewards!"
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.subheading && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.subheading}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Promo Mechanics
                                          </Label>
                                          <Textarea
                                              value={data.mechanics}
                                              onChange={(e) =>
                                                  setData(
                                                      'mechanics',
                                                      e.target.value,
                                                  )
                                              }
                                              rows={4}
                                              placeholder="Describe how to earn stamps and claim rewards..."
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.mechanics && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.mechanics}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Card Footer
                                          </Label>
                                          <Input
                                              type="text"
                                              value={data.footer}
                                              onChange={(e) =>
                                                  setData(
                                                      'footer',
                                                      e.target.value,
                                                  )
                                              }
                                              placeholder="your social media • your website"
                                              className="text-xs md:text-sm"
                                          />
                                          {errors.footer && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.footer}
                                              </p>
                                          )}
                                      </div>

                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Valid Until
                                          </Label>
                                          <Input
                                              type="date"
                                              value={data.valid_until}
                                              onChange={(e) =>
                                                  setData(
                                                      'valid_until',
                                                      e.target.value,
                                                  )
                                              }
                                          />
                                          {errors.valid_until && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.valid_until}
                                              </p>
                                          )}
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>

                          {/* Branches Tab */}
                          <TabsContent
                              value="branches"
                              className="space-y-4 md:space-y-6"
                          >
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg md:text-xl">
                                          Branch Availability
                                      </CardTitle>
                                      <CardDescription className="text-xs md:text-sm">
                                          Select which branches this card
                                          template will be available in. Leave
                                          empty to make it available everywhere.
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                      <div className="space-y-2">
                                          <Label className="text-sm md:text-base">
                                              Available Branches
                                          </Label>
                                          <MultiSelect
                                              defaultValue={data.branch_ids.map(
                                                  String,
                                              )}
                                              options={branches.map((b) => ({
                                                  value: String(b.id),
                                                  label: b.name,
                                              }))}
                                              onValueChange={(values) =>
                                                  setData(
                                                      'branch_ids',
                                                      values.map(Number),
                                                  )
                                              }
                                          />
                                          {errors.branch_ids && (
                                              <p className="text-xs text-red-500 md:text-sm">
                                                  {errors.branch_ids}
                                              </p>
                                          )}
                                      </div>

                                      {data.branch_ids.length === 0 ? (
                                          <Alert>
                                              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                                              <AlertDescription className="text-xs md:text-sm">
                                                  No branches selected — this
                                                  card template will be
                                                  available across{' '}
                                                  <strong>all branches</strong>.
                                              </AlertDescription>
                                          </Alert>
                                      ) : (
                                          <Alert>
                                              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                                              <AlertDescription className="text-xs md:text-sm">
                                                  This template will only be
                                                  available in the{' '}
                                                  <strong>
                                                      {data.branch_ids.length}
                                                  </strong>{' '}
                                                  selected branch
                                                  {data.branch_ids.length > 1
                                                      ? 'es'
                                                      : ''}
                                                  .
                                              </AlertDescription>
                                          </Alert>
                                      )}
                                  </CardContent>
                              </Card>
                          </TabsContent>
                      </Tabs>

                      {/* Create Button - Desktop - Always visible below tabs */}
                      <div className="hidden md:block">
                          <Button
                              type="submit"
                              className="w-full"
                              size="lg"
                              disabled={processing}
                          >
                              <Sparkles className="mr-2 h-4 w-4" />
                              {processing
                                  ? 'Creating Template...'
                                  : 'Create Card Template'}
                          </Button>
                      </div>
                  </div>

                  {/* Preview Section - 2 columns */}
                  <div className="lg:col-span-2">
                      <div className="lg:sticky lg:top-8">
                          <Card className="overflow-hidden">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                      <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                                      Live Preview
                                  </CardTitle>
                                  <CardDescription className="text-xs md:text-sm">
                                      See your card design in real-time
                                  </CardDescription>
                              </CardHeader>
                              <CardContent className="p-4 md:p-6">
                                  {/* Card Preview */}
                                  <div
                                      className="transform overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105"
                                      style={{
                                          backgroundColor: data.backgroundColor,
                                          backgroundImage: data.backgroundImage
                                              ? `url(${data.backgroundImage})`
                                              : 'none',
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                      }}
                                  >
                                      <div
                                          className="p-4 backdrop-blur-sm sm:p-6 md:p-8"
                                          style={{
                                              backgroundColor:
                                                  data.backgroundImage
                                                      ? 'rgba(0,0,0,0.2)'
                                                      : 'transparent',
                                          }}
                                      >
                                          {/* Logo */}
                                          {data.logo && (
                                              <div className="mb-3 flex justify-center md:mb-4">
                                                  <img
                                                      src={data.logo}
                                                      alt="Logo"
                                                      className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-xl sm:h-16 sm:w-16 md:h-20 md:w-20"
                                                  />
                                              </div>
                                          )}

                                          {/* Heading */}
                                          <h3
                                              className="mb-2 text-center text-xl font-bold tracking-wider sm:text-2xl md:text-3xl"
                                              style={{ color: data.textColor }}
                                          >
                                              {data.heading}
                                          </h3>

                                          {/* Subheading */}
                                          <p
                                              className="mb-4 text-center text-xs opacity-90 sm:text-sm md:mb-8"
                                              style={{ color: data.textColor }}
                                          >
                                              {data.subheading}
                                          </p>

                                          {/* Stamps Grid */}
                                          <div className="mb-4 grid grid-cols-5 gap-2 md:mb-6 md:gap-3">
                                              {Array.from({
                                                  length: data.stampsNeeded,
                                              }).map((_, index) => {
                                                  const stampNumber = index + 1;
                                                  const perk =
                                                      getPerkForStamp(
                                                          stampNumber,
                                                      );
                                                  const isFilled =
                                                      index <
                                                      Math.floor(
                                                          data.stampsNeeded * 1,
                                                      );

                                                  return (
                                                      <div
                                                          key={index}
                                                          className="flex flex-col items-center gap-1"
                                                      >
                                                          <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16">
                                                              <StampShape
                                                                  shape={
                                                                      data.stampShape
                                                                  }
                                                                  isFilled={
                                                                      isFilled
                                                                  }
                                                                  isReward={
                                                                      !!perk
                                                                  }
                                                                  rewardText={
                                                                      perk?.reward
                                                                  }
                                                                  color={
                                                                      perk
                                                                          ? perk.color
                                                                          : data.stampColor
                                                                  }
                                                              />
                                                          </div>
                                                          <span
                                                              className="text-[10px] font-medium sm:text-xs"
                                                              style={{
                                                                  color: data.textColor,
                                                              }}
                                                          >
                                                              {stampNumber}
                                                          </span>
                                                      </div>
                                                  );
                                              })}
                                          </div>

                                          {/* Mechanics */}
                                          <div className="mb-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur md:mb-6 md:p-4">
                                              <p className="text-center text-[10px] leading-relaxed text-gray-800 sm:text-xs">
                                                  {data.mechanics}
                                              </p>
                                          </div>

                                          {/* Footer */}
                                          <div
                                              className="border-t pt-3 md:pt-4"
                                              style={{
                                                  borderColor:
                                                      data.textColor + '40',
                                              }}
                                          >
                                              <p
                                                  className="text-center text-[10px] font-medium opacity-90 sm:text-xs"
                                                  style={{
                                                      color: data.textColor,
                                                  }}
                                              >
                                                  {data.footer}
                                              </p>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Info Alert */}
                                  <Alert className="mt-4 border-purple-200 bg-gradient-to-r from-blue-50 to-purple-50 md:mt-6">
                                      <Sparkles className="h-3 w-3 text-purple-600 md:h-4 md:w-4" />
                                      <AlertDescription className="text-[10px] sm:text-xs md:text-sm">
                                          Preview shows sample progress with{' '}
                                          {data.perks.length} reward
                                          milestone(s) configured.
                                      </AlertDescription>
                                  </Alert>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              </div>

              {/* Fixed Create Button - Mobile */}
              <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-white p-4 shadow-lg md:hidden">
                  <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={processing}
                  >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {processing ? 'Creating...' : 'Create Template'}
                  </Button>
              </div>

              {/* Spacer for mobile fixed button */}
              <div className="h-20 md:hidden"></div>
          </form>
      </AppLayout>
  );
}