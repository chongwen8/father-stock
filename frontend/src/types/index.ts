export interface Stock {
  id: number
  symbol: string
  name: string
  market: string
  market_cap?: number
  is_st: boolean
  created_at: string
  updated_at: string
}

export interface ScreeningCriteria {
  start_time: string
  end_time: string
  large_order_net_amount_min: number
  large_order_ranking?: number
  large_order_percentage?: number
  bid_amplitude_min: number
  bid_amplitude_max: number
  avg_price_ratio_min: number
  low_avg_ratio_min: number
  close_high_ratio_min: number
  volume_ratio_min: number
  volume_ratio_change_min: number
  volume_ratio_change_max: number
  turnover_ratio_max: number
  avg_turnover_ratio_max: number
  current_turnover_min: number
  current_turnover_max: number
  avg_price_ratio_10_20_min: number
  amplitude_max: number
  market_cap_max: number
  exclude_st: boolean
  include_main_board: boolean
}

// Extended criteria model for UI builder (optional fields for future expansion)
export interface ExtendedScreeningCriteria extends ScreeningCriteria {
  // Date fields to replace "今日"
  target_year?: number
  target_month?: number
  target_day?: number
  // Time segments used in original long prompt
  segment_1_start?: string
  segment_1_end?: string
  segment_2_start?: string
  segment_2_end?: string
  // Thresholds for net inflow comparisons
  large_order_net_amount_compare_window?: string // e.g. "09:30-09:32 vs 09:32-09:33"
  large_order_net_amount_delta_min?: number // e.g. > -10000000
  // Volume ratio snapshots
  volume_ratio_t1?: string // 09:31
  volume_ratio_t2?: string // 09:32
  volume_ratio_t3?: string // 09:33
  // Derived expression toggle
  enable_volume_ratio_expression?: boolean
  // Turnover historical windows
  turnover_prev_1_over_prev_3_max?: number // < 0.7
  turnover_prev_3_over_prev_120_max?: number // < 8
  // Historical averages
  avg_price_10_over_20_min?: number // > 0.98
  prev_2_days_amplitude_max?: number // < 18.6
  prev_3_days_pattern_filter?: boolean // 非一字线非T字线
  // Prompt template name
  template_name?: string
}

export interface ScreeningRequest {
  prompt: string
  criteria?: ScreeningCriteria
  custom_filters?: Record<string, any>
}

export interface ScreeningResponse {
  prompt: string
  criteria: ScreeningCriteria
  results: Stock[]
  total_count: number
  execution_time: number
}

export interface PromptProcessResponse {
  original_prompt: string
  parsed_criteria: ScreeningCriteria
  english_description: string
}

// Template management interfaces
export interface ScreeningTemplate {
  id: string
  name: string
  description?: string
  template: string
  criteria: ExtendedScreeningCriteria
  created_at: string
  updated_at: string
  is_favorite: boolean
  usage_count: number
  tags?: string[]
}

export interface TemplateHistory {
  id: string
  template_id: string
  prompt: string
  criteria: ScreeningCriteria
  results_count?: number
  execution_time?: number
  created_at: string
}
