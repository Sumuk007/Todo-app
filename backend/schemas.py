from pydantic import BaseModel

class TodoBase(BaseModel):
    title: str
    description: str | None = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

class Todo(TodoBase):
    id: int

    class Config:
        from_attrubutes = True