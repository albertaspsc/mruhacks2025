import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Eye } from "lucide-react";
import {
  formatDate,
  formatTime,
  getCapacityLabel,
} from "@/utils/workshopUtils";
import { Workshop } from "@/types/workshop";

type WorkshopCardProps = {
  workshop: Workshop;
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
  className?: string;
};

export default function WorkshopCard({
  workshop,
  onRegister,
  onUnregister,
  className = "",
}: WorkshopCardProps) {
  const capacityLabel = getCapacityLabel(workshop);

  return (
    <div
      className={`border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-full w-full box-border overflow-auto ${className}`}
    >
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
          {formatDate(workshop.date)} {formatTime(workshop.startTime)}–
          {formatTime(workshop.endTime)}
        </div>
        <div>
          <span className="font-medium text-base">{workshop.title}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span>{capacityLabel} participants</span>
          {workshop.isFull && <span className="text-red-500 ml-1">(Full)</span>}
        </div>
        {workshop.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{workshop.location}</span>
          </div>
        )}
        {workshop.description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {workshop.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-2xl bg-white border border-gray-200 shadow-lg !rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">
                {workshop.title}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-base">
                  <div className="text-lg text-muted-foreground">
                    {formatDate(workshop.date)} •{" "}
                    {formatTime(workshop.startTime)} –{" "}
                    {formatTime(workshop.endTime)}
                  </div>

                  <div className="text-lg">
                    <span className="font-semibold">Capacity:</span>{" "}
                    {capacityLabel} participants
                    {workshop.isFull && (
                      <span className="text-red-500 ml-2 font-semibold">
                        (Full)
                      </span>
                    )}
                  </div>

                  {workshop.location && (
                    <div className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">Location:</span>
                      <span>{workshop.location}</span>
                    </div>
                  )}

                  {workshop.description && (
                    <div>
                      <div className="font-semibold text-lg mb-2">
                        Description:
                      </div>
                      <div className="text-base leading-relaxed">
                        {workshop.description}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Close
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (workshop.isRegistered) {
                    onUnregister(workshop.id);
                  } else {
                    onRegister(workshop.id);
                  }
                }}
                disabled={workshop.isFull && !workshop.isRegistered}
                className="rounded-xl"
              >
                {workshop.isRegistered
                  ? "Unregister"
                  : workshop.isFull
                    ? "Full"
                    : "Register"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {workshop.isRegistered ? (
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => onUnregister(workshop.id)}
          >
            Unregister
          </Button>
        ) : (
          <Button
            className="rounded-xl"
            onClick={() => onRegister(workshop.id)}
            disabled={workshop.isFull}
          >
            {workshop.isFull ? "Full" : "Register"}
          </Button>
        )}
      </div>
    </div>
  );
}
