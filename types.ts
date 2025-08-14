export enum Category {
  Food = '食費',
  Transport = '交通費',
  Shopping = '買い物',
  Utilities = '光熱費',
  Entertainment = '娯楽',
  Housing = '住居費',
  Health = '健康',
  Other = 'その他',
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
}

export interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
}
