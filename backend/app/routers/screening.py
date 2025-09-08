from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schemas import ScreeningRequest, ScreeningResponse, PromptProcessResponse
from app.services.screening_service import ScreeningService
from app.utils.prompt_parser import PromptParser

router = APIRouter()

@router.post("/process-prompt", response_model=PromptProcessResponse)
async def process_prompt(request: ScreeningRequest):
    """
    Process Chinese stock screening prompt and convert to structured criteria
    
    Example prompt: 今日9点30分至9点33分特大单净额排名行业前15...
    """
    parser = PromptParser()
    try:
        criteria = parser.parse_chinese_prompt(request.prompt)
        variables = parser.extract_variables(request.prompt)
        return PromptProcessResponse(
            original_prompt=request.prompt,
            parsed_criteria=criteria,
            english_description=parser.get_english_description(criteria),
            variables=variables
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse prompt: {str(e)}") from e

@router.post("/screen", response_model=ScreeningResponse)
async def screen_stocks(
    request: ScreeningRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Screen stocks based on criteria from Chinese prompt or structured criteria
    """
    screening_service = ScreeningService(db)
    
    try:
        # If no criteria provided, parse from prompt
        if not request.criteria:
            parser = PromptParser()
            criteria = parser.parse_chinese_prompt(request.prompt)
        else:
            criteria = request.criteria
        
        # Execute screening
        results = await screening_service.screen_stocks(criteria)
        
        # Save results in background
        background_tasks.add_task(
            screening_service.save_screening_result,
            request.prompt,
            criteria,
            results
        )
        
        return ScreeningResponse(
            prompt=request.prompt,
            criteria=criteria,
            results=results["stocks"],
            total_count=results["total_count"],
            execution_time=results["execution_time"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screening failed: {str(e)}") from e

@router.get("/history")
async def get_screening_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get screening history"""
    screening_service = ScreeningService(db)
    return screening_service.get_screening_history(skip=skip, limit=limit)

@router.post("/update-variables")
async def update_prompt_variables(
    original_prompt: str,
    variables: dict,
    db: Session = Depends(get_db)
):
    """
    Update variables in the original prompt
    
    Example:
    {
        "start_time": "09:35",
        "end_time": "09:38",
        "large_order_ranking": 20
    }
    """
    parser = PromptParser()
    try:
        updated_prompt = parser.update_prompt_variables(original_prompt, variables)
        return {
            "original_prompt": original_prompt,
            "updated_prompt": updated_prompt,
            "variables_changed": variables
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update variables: {str(e)}") from e
