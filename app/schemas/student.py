from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    roll_number: str = Field(..., min_length=1, max_length=20)
    class_name: str = Field(..., min_length=1, max_length=50)
    section: str = Field(..., min_length=1, max_length=10)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    roll_number: Optional[str] = Field(None, min_length=1, max_length=20)
    class_name: Optional[str] = Field(None, min_length=1, max_length=50)
    section: Optional[str] = Field(None, min_length=1, max_length=10)

class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentImageResponse(BaseModel):
    filename: str
    url: str
