from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StockBase(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    name: str = Field(..., description="Stock name")
    market: str = Field(..., description="Market type")

class StockCreate(StockBase):
    market_cap: Optional[float] = None
    is_st: bool = False

class StockResponse(StockBase):
    id: int
    market_cap: Optional[float] = None
    is_st: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ScreeningCriteria(BaseModel):
    # Time-based criteria
    start_time: str = Field(default="09:30", description="Start time (HH:MM)")
    end_time: str = Field(default="09:33", description="End time (HH:MM)")
    
    # Volume and price criteria
    large_order_net_amount_min: float = Field(default=1000000, description="Minimum large order net amount")
    large_order_ranking: Optional[int] = Field(default=15, description="Industry ranking for large orders")
    large_order_percentage: Optional[float] = Field(default=0.2, description="Top percentage for large orders")
    
    # Price movement criteria
    bid_amplitude_min: float = Field(default=0, description="Minimum bid amplitude")
    bid_amplitude_max: float = Field(default=4, description="Maximum bid amplitude")
    
    # Average price criteria
    avg_price_ratio_min: float = Field(default=1.003, description="Average price / opening price minimum")
    
    # Price stability criteria
    low_avg_ratio_min: float = Field(default=0.985, description="Low price / average price minimum")
    close_high_ratio_min: float = Field(default=0.985, description="Close / high price minimum")
    
    # Volume ratio criteria
    volume_ratio_min: float = Field(default=3, description="Minimum volume ratio")
    volume_ratio_change_min: float = Field(default=0.01, description="Minimum volume ratio change")
    volume_ratio_change_max: float = Field(default=0.33, description="Maximum volume ratio change")
    
    # Turnover criteria
    turnover_ratio_max: float = Field(default=0.7, description="Maximum recent turnover ratio")
    avg_turnover_ratio_max: float = Field(default=8, description="Maximum average turnover ratio")
    current_turnover_min: float = Field(default=0.004, description="Minimum current turnover")
    current_turnover_max: float = Field(default=0.05, description="Maximum current turnover")
    
    # Historical price criteria
    avg_price_ratio_10_20_min: float = Field(default=0.98, description="10-day vs 20-day average price ratio minimum")
    amplitude_max: float = Field(default=18.6, description="Maximum amplitude in recent days")
    
    # Market criteria
    market_cap_max: float = Field(default=20000000000, description="Maximum market cap (200亿)")
    exclude_st: bool = Field(default=True, description="Exclude ST stocks")
    include_main_board: bool = Field(default=True, description="Include main board stocks")

class ScreeningRequest(BaseModel):
    prompt: str = Field(..., description="Original Chinese prompt")
    criteria: Optional[ScreeningCriteria] = None
    custom_filters: Optional[Dict[str, Any]] = None

class ScreeningResponse(BaseModel):
    prompt: str
    criteria: ScreeningCriteria
    results: List[StockResponse]
    total_count: int
    execution_time: float

class PromptProcessResponse(BaseModel):
    original_prompt: str
    parsed_criteria: ScreeningCriteria
    english_description: str
    variables: Optional[Dict[str, Any]] = None  # Extracted raw variables from prompt for UI editing
