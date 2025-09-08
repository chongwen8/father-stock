from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.stock import Stock
from app.models.schemas import StockCreate, StockResponse

class StockService:
    def __init__(self, db: Session):
        self.db = db

    def get_stocks(self, skip: int = 0, limit: int = 100, market: Optional[str] = None) -> List[StockResponse]:
        """Get stocks with optional filtering by market"""
        query = self.db.query(Stock)
        
        if market:
            query = query.filter(Stock.market == market)
        
        stocks = query.offset(skip).limit(limit).all()
        return [StockResponse.from_orm(stock) for stock in stocks]

    def get_stock_by_symbol(self, symbol: str) -> Optional[StockResponse]:
        """Get stock by symbol"""
        stock = self.db.query(Stock).filter(Stock.symbol == symbol).first()
        return StockResponse.from_orm(stock) if stock else None

    def create_stock(self, stock_data: StockCreate) -> StockResponse:
        """Create a new stock"""
        db_stock = Stock(**stock_data.dict())
        self.db.add(db_stock)
        self.db.commit()
        self.db.refresh(db_stock)
        return StockResponse.from_orm(db_stock)

    def update_stock(self, symbol: str, stock_data: StockCreate) -> Optional[StockResponse]:
        """Update stock information"""
        db_stock = self.db.query(Stock).filter(Stock.symbol == symbol).first()
        if not db_stock:
            return None
        
        for field, value in stock_data.dict(exclude_unset=True).items():
            setattr(db_stock, field, value)
        
        self.db.commit()
        self.db.refresh(db_stock)
        return StockResponse.from_orm(db_stock)

    def delete_stock(self, symbol: str) -> bool:
        """Delete a stock"""
        db_stock = self.db.query(Stock).filter(Stock.symbol == symbol).first()
        if not db_stock:
            return False
        
        self.db.delete(db_stock)
        self.db.commit()
        return True

    def get_stocks_by_criteria(self, criteria: dict) -> List[Stock]:
        """Get stocks that match specific criteria"""
        query = self.db.query(Stock)
        
        # Apply filters based on criteria
        if criteria.get("exclude_st"):
            query = query.filter(Stock.is_st == False)
        
        if criteria.get("include_main_board"):
            query = query.filter(Stock.market == "主板")
        
        if criteria.get("market_cap_max"):
            query = query.filter(Stock.market_cap <= criteria["market_cap_max"])
        
        return query.all()
