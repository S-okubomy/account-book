export const Category = {
  // 固定費
  Housing: '住居費',
  Insurance: '保険料',
  Communication: '通信費',
  Car: '自動車費',
  Utilities: '水道光熱費',
  Education: '教育費',
  // 変動費
  Food: '食費',
  DailyNecessities: '日用品費',
  EatingOut: '外食',
  Socializing: '交際費',
  Transport: '交通費',
  Medical: '医療費',
  Beauty: '美容費',
  Special: '特別費',
  Other: 'その他',
};

export const ExpenseType = {
  Fixed: '固定費',
  Variable: '変動費',
};

export const CategoryExpenseType = {
  [Category.Housing]: ExpenseType.Fixed,
  [Category.Insurance]: ExpenseType.Fixed,
  [Category.Communication]: ExpenseType.Fixed,
  [Category.Car]: ExpenseType.Fixed,
  [Category.Utilities]: ExpenseType.Fixed,
  [Category.Education]: ExpenseType.Fixed,
  [Category.Food]: ExpenseType.Variable,
  [Category.DailyNecessities]: ExpenseType.Variable,
  [Category.EatingOut]: ExpenseType.Variable,
  [Category.Socializing]: ExpenseType.Variable,
  [Category.Transport]: ExpenseType.Variable,
  [Category.Medical]: ExpenseType.Variable,
  [Category.Beauty]: ExpenseType.Variable,
  [Category.Special]: ExpenseType.Variable,
  [Category.Other]: ExpenseType.Variable,
};

export interface Budgets {
  overall: number;
  categories: {
    [category: string]: number;
  };
}
