from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db
from app.models.schemas import StockResponse, StockCreate
from app.services.stock_service import StockService

router = APIRouter()

@router.get("/", response_model=List[StockResponse])
async def get_stocks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    market: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of stocks with pagination"""
    stock_service = StockService(db)
    stocks = stock_service.get_stocks(skip=skip, limit=limit, market=market)
    return stocks

@router.get("/{symbol}", response_model=StockResponse)
async def get_stock(symbol: str, db: Session = Depends(get_db)):
    """Get stock by symbol"""
    stock_service = StockService(db)
    stock = stock_service.get_stock_by_symbol(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock

@router.post("/", response_model=StockResponse)
async def create_stock(stock: StockCreate, db: Session = Depends(get_db)):
    """Create a new stock"""
    stock_service = StockService(db)
    return stock_service.create_stock(stock)

@router.put("/{symbol}", response_model=StockResponse)
async def update_stock(symbol: str, stock: StockCreate, db: Session = Depends(get_db)):
    """Update stock information"""
    stock_service = StockService(db)
    updated_stock = stock_service.update_stock(symbol, stock)
    if not updated_stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return updated_stock

@router.delete("/{symbol}")
async def delete_stock(symbol: str, db: Session = Depends(get_db)):
    """Delete a stock"""
    stock_service = StockService(db)
    success = stock_service.delete_stock(symbol)
    if not success:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"message": "Stock deleted successfully"}
