 export type TRentalOrderItemInput = {
  gearItemId: string;
  quantity: number;
};

export type TCreateRentalOrder = {
  startDate: string;
  endDate: string;  
  items: TRentalOrderItemInput[];
};
