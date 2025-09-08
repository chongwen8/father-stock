import re
from typing import Dict, Any, List, Tuple
from app.models.schemas import ScreeningCriteria

class PromptParser:
    """Parse Chinese stock screening prompts into structured criteria"""
    
    def __init__(self):
        self.time_pattern = r'(\d+)点(\d+)分'
        self.number_pattern = r'(\d+(?:\.\d+)?)'
        
    def parse_chinese_prompt(self, prompt: str) -> ScreeningCriteria:
        """
        Parse the Chinese prompt into structured screening criteria
        
        Example prompt: 今日9点30分至9点33分特大单净额排名行业前15或今日9点30分至9点33分特大单净额排名行业前20%；
        今日竞价分时涨跌幅大于0小于4；今日9点30分至9点33分均价/开盘价大于1.003；...
        """
        criteria = ScreeningCriteria()
        
        # Extract time ranges
        time_matches = re.findall(self.time_pattern, prompt)
        if len(time_matches) >= 2:
            start_hour, start_min = time_matches[0]
            end_hour, end_min = time_matches[1]
            criteria.start_time = f"{start_hour.zfill(2)}:{start_min.zfill(2)}"
            criteria.end_time = f"{end_hour.zfill(2)}:{end_min.zfill(2)}"
        
        # Parse specific criteria
        if "特大单净额排名行业前" in prompt:
            ranking_match = re.search(r'行业前(\d+)', prompt)
            if ranking_match:
                criteria.large_order_ranking = int(ranking_match.group(1))
            
            percentage_match = re.search(r'行业前(\d+(?:\.\d+)?)%', prompt)
            if percentage_match:
                criteria.large_order_percentage = float(percentage_match.group(1)) / 100
        
        # Parse amplitude criteria
        if "竞价分时涨跌幅大于" in prompt:
            amplitude_match = re.search(r'涨跌幅大于(\d+(?:\.\d+)?)小于(\d+(?:\.\d+)?)', prompt)
            if amplitude_match:
                criteria.bid_amplitude_min = float(amplitude_match.group(1))
                criteria.bid_amplitude_max = float(amplitude_match.group(2))
        
        # Parse price ratio criteria
        if "均价/开盘价大于" in prompt:
            ratio_match = re.search(r'均价/开盘价大于(\d+(?:\.\d+)?)', prompt)
            if ratio_match:
                criteria.avg_price_ratio_min = float(ratio_match.group(1))
        
        # Parse volume ratio criteria
        if "量比大于" in prompt:
            volume_match = re.search(r'量比大于(\d+(?:\.\d+)?)', prompt)
            if volume_match:
                criteria.volume_ratio_min = float(volume_match.group(1))
        
        # Parse turnover criteria
        if "换手率大于" in prompt:
            turnover_match = re.search(r'换手率大于(\d+(?:\.\d+)?)%小于(\d+(?:\.\d+)?)%', prompt)
            if turnover_match:
                criteria.current_turnover_min = float(turnover_match.group(1)) / 100
                criteria.current_turnover_max = float(turnover_match.group(2)) / 100
        
        # Parse market cap criteria
        if "市值小于" in prompt:
            market_cap_match = re.search(r'市值小于(\d+)亿', prompt)
            if market_cap_match:
                criteria.market_cap_max = float(market_cap_match.group(1)) * 100000000  # 转换为元
        
        # Parse ST and board criteria
        if "非ST" in prompt:
            criteria.exclude_st = True
        
        if "主板" in prompt:
            criteria.include_main_board = True
        
        return criteria

    def extract_variables(self, prompt: str) -> Dict[str, Any]:
        """Extract variable placeholders / numeric & time tokens for UI auto-fill.

        Strategy:
        - Capture all HH点MM分 patterns -> produce ordered times list and infer start/end/segments
        - Capture numeric thresholds tied to Chinese indicator keywords
        - Provide raw matches so frontend can map / rename if parser misses semantics
        """
        variables: Dict[str, Any] = {}

        # Times
        time_matches: List[Tuple[str, str]] = re.findall(self.time_pattern, prompt)
        times_formatted = [f"{h.zfill(2)}:{m.zfill(2)}" for h, m in time_matches]
        if times_formatted:
            variables["_times"] = times_formatted
            if len(times_formatted) >= 2:
                variables.setdefault("start_time", times_formatted[0])
                variables.setdefault("end_time", times_formatted[1])
            # Additional segments if >2 times
            if len(times_formatted) >= 4:
                variables["segment_1_start"], variables["segment_1_end"] = times_formatted[0], times_formatted[1]
                variables["segment_2_start"], variables["segment_2_end"] = times_formatted[2], times_formatted[3]

        # Ranking (行业前X)
        ranking_match = re.search(r"行业前(\d+)", prompt)
        if ranking_match:
            variables["large_order_ranking"] = int(ranking_match.group(1))

        # Percentage style ranking (行业前X%)
        perc_match = re.search(r"行业前(\d+(?:\.\d+)?)%", prompt)
        if perc_match:
            variables["large_order_percentage"] = float(perc_match.group(1)) / 100

        # 均价/开盘价大于X
        avg_open_match = re.search(r"均价/开盘价大于(\d+(?:\.\d+)?)", prompt)
        if avg_open_match:
            variables["avg_price_ratio_min"] = float(avg_open_match.group(1))

        # 竞价分时涨跌幅大于A小于B
        amplitude_match = re.search(r"涨跌幅大于(\d+(?:\.\d+)?)小于(\d+(?:\.\d+)?)", prompt)
        if amplitude_match:
            variables["bid_amplitude_min"] = float(amplitude_match.group(1))
            variables["bid_amplitude_max"] = float(amplitude_match.group(2))

        # 量比大于X
        vol_ratio_match = re.search(r"量比大于(\d+(?:\.\d+)?)", prompt)
        if vol_ratio_match:
            variables["volume_ratio_min"] = float(vol_ratio_match.group(1))

        # 换手率大于A%小于B%
        turnover_match = re.search(r"换手率大于(\d+(?:\.\d+)?)%小于(\d+(?:\.\d+)?)%", prompt)
        if turnover_match:
            variables["current_turnover_min"] = float(turnover_match.group(1)) / 100
            variables["current_turnover_max"] = float(turnover_match.group(2)) / 100

        # 市值小于X亿
        market_cap_match = re.search(r"市值小于(\d+)亿", prompt)
        if market_cap_match:
            variables["market_cap_max"] = float(market_cap_match.group(1)) * 100000000

        # Flags
        if "非ST" in prompt:
            variables["exclude_st"] = True
        if "主板" in prompt:
            variables["include_main_board"] = True

        # Raw numeric tokens (as fallback) - might include duplicates; keep unique sorted
        numeric_tokens = re.findall(self.number_pattern, prompt)
        if numeric_tokens:
            uniq_nums: List[str] = []
            for n in numeric_tokens:
                if n not in uniq_nums:
                    uniq_nums.append(n)
            variables["_numbers"] = uniq_nums

        return variables
    
    def get_english_description(self, criteria: ScreeningCriteria) -> str:
        """Convert criteria to English description"""
        description = []
        
        description.append(f"Time range: {criteria.start_time} to {criteria.end_time}")
        
        if criteria.large_order_ranking:
            description.append(f"Large order industry ranking: top {criteria.large_order_ranking}")
        
        if criteria.large_order_percentage:
            description.append(f"Large order industry percentage: top {criteria.large_order_percentage*100}%")
        
        if criteria.bid_amplitude_min is not None and criteria.bid_amplitude_max is not None:
            description.append(f"Bid amplitude: {criteria.bid_amplitude_min}% to {criteria.bid_amplitude_max}%")
        
        if criteria.volume_ratio_min:
            description.append(f"Volume ratio > {criteria.volume_ratio_min}")
        
        if criteria.current_turnover_min and criteria.current_turnover_max:
            description.append(f"Turnover rate: {criteria.current_turnover_min*100}% to {criteria.current_turnover_max*100}%")
        
        if criteria.market_cap_max:
            description.append(f"Market cap < {criteria.market_cap_max/100000000}B CNY")
        
        if criteria.exclude_st:
            description.append("Exclude ST stocks")
        
        if criteria.include_main_board:
            description.append("Main board only")
        
        return "; ".join(description)
    
    def update_prompt_variables(self, original_prompt: str, variables: Dict[str, Any]) -> str:
        """Update variables in the original prompt"""
        updated_prompt = original_prompt
        
        # Update time variables
        if "start_time" in variables or "end_time" in variables:
            # This is a simplified implementation
            # In practice, you'd want more sophisticated time replacement
            pass
        
        # Update ranking variables
        if "large_order_ranking" in variables:
            updated_prompt = re.sub(
                r'行业前\d+',
                f'行业前{variables["large_order_ranking"]}',
                updated_prompt
            )
        
        # Add more variable updates as needed
        
        return updated_prompt
