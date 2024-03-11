"use client";

import { Category } from "@prisma/client";
import {
  FcEngineering,
  FcFilmReel,
  FcRuler,
  FcReading,
  FcMultipleDevices,
  FcScatterPlot,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
  FcGlobe,
  FcBiomass
} from "react-icons/fc";
import { IconType } from "react-icons";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
  "Math": FcScatterPlot,
  "Language Arts": FcReading,
  "Physics": FcRuler,
  "Chemistry": FcBiomass,
  "Computer Science": FcMultipleDevices,
  "Biology": FcGlobe,
  "Miscellaneous": FcEngineering,
};

export const Categories = ({
  items,
}: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  )
}