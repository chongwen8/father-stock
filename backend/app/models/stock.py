from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from .database import Base
from datetime import datetime

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    market = Column(String(20), nullable=False)  # 主板, 创业板, 科创板
    market_cap = Column(Float)  # 市值
    is_st = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StockData(Base):
    __tablename__ = "stock_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    date = Column(DateTime, nullable=False)
    open_price = Column(Float)
    close_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    volume = Column(Float)
    turnover = Column(Float)  # 换手率
    volume_ratio = Column(Float)  # 量比
    created_at = Column(DateTime, default=datetime.utcnow)

class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    criteria = Column(Text)  # JSON string of criteria
    results = Column(Text)  # JSON string of results
    created_at = Column(DateTime, default=datetime.utcnow)
