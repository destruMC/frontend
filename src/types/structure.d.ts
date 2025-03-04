import type {File} from "@/types/file";
import type {User} from "@/types/user";

export interface StructurePreview {
  id: string;
  name: string;
  image: string;
  creator: string;
}

export interface Structure {
  id: string;
  name: string;
  summary: string;
  description: string;
  files: File[];
  images: File[];
  creators: User[];
  created: Date;
}
