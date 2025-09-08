import time
import json
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.stock import ScreeningResult
from app.models.schemas import ScreeningCriteria, StockResponse
from app.services.stock_service import StockService

class ScreeningService:
    def __init__(self, db: Session):
        self.db = db
        self.stock_service = StockService(db)

    async def screen_stocks(self, criteria: ScreeningCriteria) -> Dict[str, Any]:
        """
        Screen stocks based on the provided criteria
        This is a simplified implementation - in production you'd integrate with
        real stock data APIs like akshare, yfinance, etc.
        """
        start_time = time.time()
        
        # Get base stock list based on basic criteria
        base_criteria = {
            "exclude_st": criteria.exclude_st,
            "include_main_board": criteria.include_main_board,
            "market_cap_max": criteria.market_cap_max
        }
        
        stocks = self.stock_service.get_stocks_by_criteria(base_criteria)
        
        # TODO: Implement detailed filtering logic
        # This would involve:
        # 1. Fetching real-time market data
        # 2. Calculating technical indicators
        # 3. Applying time-based filters
        # 4. Volume and price analysis
        
        # For now, return a subset as demo
        filtered_stocks = stocks[:10]  # Demo: return first 10 stocks
        
        # Convert to response format
        stock_responses = [
            StockResponse(
                id=stock.id,
                symbol=stock.symbol,
                name=stock.name,
                market=stock.market,
                market_cap=stock.market_cap,
                is_st=stock.is_st,
                created_at=stock.created_at,
                updated_at=stock.updated_at
            )
            for stock in filtered_stocks
        ]
        
        execution_time = time.time() - start_time
        
        return {
            "stocks": stock_responses,
            "total_count": len(stock_responses),
            "execution_time": execution_time
        }

    def save_screening_result(self, prompt: str, criteria: ScreeningCriteria, results: Dict[str, Any]):
        """Save screening results to database"""
        screening_result = ScreeningResult(
            prompt=prompt,
            criteria=json.dumps(criteria.dict()),
            results=json.dumps({
                "total_count": results["total_count"],
                "execution_time": results["execution_time"],
                "stock_symbols": [stock.symbol for stock in results["stocks"]]
            })
        )
        
        self.db.add(screening_result)
        self.db.commit()

    def get_screening_history(self, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Get screening history"""
        results = self.db.query(ScreeningResult).offset(skip).limit(limit).all()
        
        history = []
        for result in results:
            history.append({
                "id": result.id,
                "prompt": result.prompt,
                "criteria": json.loads(result.criteria),
                "results": json.loads(result.results),
                "created_at": result.created_at
            })
        
        return history
