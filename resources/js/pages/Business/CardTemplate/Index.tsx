import ModuleHeading from "@/components/module-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Plus, Edit, Trash2, Eye, Sparkles, Award, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function Index({ cardTemplates = [] }) {
  const [hoveredStamp, setHoveredStamp] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const handleEdit = (id) => {
    router.visit(`/business/card-templates/${id}/edit`);
  };

  const handleDelete = (id) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      router.delete(`/business/card-templates/${templateToDelete}`, {
        onSuccess: () => {
          toast.success("Deleted Successfully.");
        },
        onError: (e) => {
          if(e.error){
            toast.error(e.error);
          }else {
            toast.error("An error occured.")
          }
        }
      });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleView = (id) => {
    router.visit(`/business/card-templates/${id}`);
  };

  const getPerkForStamp = (perks, stampNumber) => {
    return perks.find(p => p.stampNumber === stampNumber);
  };

  const StampShape = ({ shape, isFilled, isReward, rewardText, color, filledColor, emptyColor, stampImage, details, index }) => {
    const fillColor = isFilled ? filledColor : emptyColor;
    const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';

    const shapes = {
      circle: (
        <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow transition-all duration-300 w-full h-full">
          <defs>
            {stampImage && (
              <pattern id={`stampPattern-${index}`} x="0" y="0" width="1" height="1">
                <image href={`/${stampImage}`} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <circle cx="50" cy="50" r="45" fill={stampImage && isFilled ? `url(#stampPattern-${index})` : fillColor} stroke={strokeColor} strokeWidth="3" />
        </svg>
      ),
      star: (
        <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow transition-all duration-300 w-full h-full">
          <defs>
            {stampImage && (
              <pattern id={`stampPattern-${index}`} x="0" y="0" width="1" height="1">
                <image href={`/${stampImage}`} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
            fill={stampImage && isFilled ? `url(#stampPattern-${index})` : fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      ),
      square: (
        <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow transition-all duration-300 w-full h-full">
          <defs>
            {stampImage && (
              <pattern id={`stampPattern-${index}`} x="0" y="0" width="1" height="1">
                <image href={`/${stampImage}`} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <rect x="10" y="10" width="80" height="80" rx="12" fill={stampImage && isFilled ? `url(#stampPattern-${index})` : fillColor} stroke={strokeColor} strokeWidth="3" />
        </svg>
      ),
      hexagon: (
        <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow transition-all duration-300 w-full h-full">
          <defs>
            {stampImage && (
              <pattern id={`stampPattern-${index}`} x="0" y="0" width="1" height="1">
                <image href={`/${stampImage}`} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill={stampImage && isFilled ? `url(#stampPattern-${index})` : fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      )
    };

    return (
      <div 
        className="relative group"
        onMouseEnter={() => isReward && details && setHoveredStamp(`${index}`)}
        onMouseLeave={() => setHoveredStamp(null)}
      >
        {shapes[shape] || shapes.circle}
        {isReward && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-[8px] text-center px-0.5 leading-tight drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {rewardText}
            </span>
          </div>
        )}
        {isFilled && !isReward && !stampImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={12} className="text-white animate-pulse" />
          </div>
        )}
        {/* Hover Tooltip */}
        {isReward && details && hoveredStamp === `${index}` && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap max-w-[200px] text-center">
              <div className="font-bold mb-1">{rewardText}</div>
              <div className="text-gray-300 text-[10px]">{details}</div>
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
          <Head title="Loyalty Cards" />
          <ModuleHeading
              title="Loyalty Cards"
              description="List of your loyalty cards"
          >
              <Button
                  onClick={() =>
                      router.visit('/business/card-templates/create')
                  }
              >
                  <Plus className="h-4 w-4" /> Create New Template
              </Button>
          </ModuleHeading>

          {/* Empty State */}
          {cardTemplates.length === 0 && (
              <Alert className="mt-8">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                      No loyalty cards yet. Create your first loyalty card
                      template to get started!
                  </AlertDescription>
              </Alert>
          )}

          {/* Loyalty Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cardTemplates.map((template) => (
                  <Card
                      key={template.id}
                      className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                  >
                      {/* Card Preview */}
                      <div
                          className="relative mt-0 h-64 p-6"
                          style={{
                              backgroundColor: template.backgroundColor,
                              backgroundImage: template.backgroundImage
                                  ? `url(/${template.backgroundImage})`
                                  : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }}
                      >
                          <div
                              className="h-full rounded-lg backdrop-blur-sm"
                              style={{
                                  backgroundColor: template.backgroundImage
                                      ? 'rgba(0,0,0,0.2)'
                                      : 'transparent',
                              }}
                          >
                              <div className="flex h-full flex-col p-4">
                                  {/* Logo */}
                                  {template.logo && (
                                      <div className="mb-2 flex justify-center">
                                          <img
                                              src={`/${template.logo}`}
                                              alt="Logo"
                                              className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-lg"
                                          />
                                      </div>
                                  )}

                                  {/* Heading */}
                                  <h3
                                      className="mb-1 text-center text-lg font-bold tracking-wide"
                                      style={{ color: template.textColor }}
                                  >
                                      {template.heading}
                                  </h3>

                                  {/* Subheading */}
                                  {template.subheading && (
                                      <p
                                          className="mb-3 text-center text-xs opacity-90"
                                          style={{ color: template.textColor }}
                                      >
                                          {template.subheading}
                                      </p>
                                  )}

                                  {/* Stamps Grid - Show first 10 stamps */}
                                  <div className="mb-3 grid flex-1 grid-cols-5 gap-1.5">
                                      {Array.from({
                                          length: Math.min(
                                              10,
                                              template.stampsNeeded,
                                          ),
                                      }).map((_, index) => {
                                          const stampNumber = index + 1;
                                          const perk = getPerkForStamp(
                                              template.perks || [],
                                              stampNumber,
                                          );
                                          const isFilled =
                                              index <
                                              Math.floor(
                                                  template.stampsNeeded * 0.6,
                                              );

                                          return (
                                              <div
                                                  key={index}
                                                  className="flex flex-col items-center"
                                              >
                                                  <div className="h-8 w-8">
                                                      <StampShape
                                                          shape={
                                                              template.stampShape
                                                          }
                                                          isFilled={isFilled}
                                                          isReward={!!perk}
                                                          rewardText={
                                                              perk?.reward
                                                          }
                                                          color={
                                                              perk
                                                                  ? perk.color
                                                                  : template.stampFilledColor
                                                          }
                                                          filledColor={
                                                              template.stampFilledColor
                                                          }
                                                          emptyColor={
                                                              template.stampEmptyColor
                                                          }
                                                          stampImage={
                                                              template.stampImage
                                                          }
                                                          details={
                                                              perk?.details
                                                          }
                                                          index={`${template.id}-${index}`}
                                                      />
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>

                                  {/* Footer Info */}
                                  <div className="text-center">
                                      <p
                                          className="text-[10px] opacity-75"
                                          style={{ color: template.textColor }}
                                      >
                                          {template.footer || 'Loyalty Card'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Card Info & Actions */}
                      <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                              <div className="flex-1">
                                  <CardTitle className="flex items-center gap-2 text-lg">
                                      {template.name}
                                      {template.perks &&
                                          template.perks.length > 0 && (
                                              <Badge className="bg-green-500 text-xs text-white">
                                                  <Award className="mr-1 h-3 w-3" />
                                                  {template.perks.length} Perks
                                              </Badge>
                                          )}
                                      {template.is_expired && (
                                          <div className="flex items-center gap-2">
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild>
                                                          <Badge className="bg-red-500">
                                                              Expired{' '}
                                                              <Info className="h-4 w-4 cursor-help" />
                                                          </Badge>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                          <p>
                                                              Expired loyalty
                                                              card is not
                                                              visible to
                                                              customers
                                                          </p>
                                                      </TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                          </div>
                                      )}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                      {template.stampsNeeded} stamps needed |
                                      Valid Until:{' '}
                                      {template.valid_until_formatted}
                                  </CardDescription>
                              </div>
                          </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                          {/* Mechanics Preview */}
                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                              {template.mechanics}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleView(template.id)}
                              >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                              </Button>

                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEdit(template.id)}
                              >
                                  <Edit className="mr-1 h-4 w-4" />
                                  Edit
                              </Button>
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(template.id)}
                              >
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
          >
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Delete Loyalty Card Template?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                          <span className="font-semibold text-gray-900">
                              Are you sure you want to delete this loyalty card
                              template?
                          </span>
                          <span>
                              Customers who are already using this loyalty card
                              might be shocked that it's gone. This action
                              cannot be undone and will affect all existing
                              customer cards using this template.
                          </span>
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>
                          Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                          onClick={confirmDelete}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                          Delete Template
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </AppLayout>
  );
}