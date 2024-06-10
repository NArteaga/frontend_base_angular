export interface Rule {
  type: string;
  message: string;
}

export interface Document {
  name: string;
  path: string;
  mime: string;
  type: string;
}
