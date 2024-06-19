export interface IStockLocation {
    location: string;
    quantity: number;
  }
  
  export interface IProduct {
    _id: string;
    boxCode: string;
    productCode: string;
    name: string;
    piecesPerBox: number;
    cost: number;
    price1: number;
    price2: number;
    price3: number;
    price4: number;
    price5: number;
    stockLocations: IStockLocation[];
    createdAt: Date;
    updatedAt: Date;
    quantity?: number;
    selectedPrice?: number;
  }