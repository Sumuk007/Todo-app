from fastapi import FastAPI, Depends, HTTPException, Path, status;
from fastapi.middleware.cors import CORSMiddleware;
import uvicorn;
from typing import List;
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import  Base
from schemas import TodoCreate, TodoUpdate
from schemas import Todo
from models import Todo as TodoModel


app = FastAPI()

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/todos", response_model=List[Todo])
def read_todos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    todos = db.query(TodoModel).offset(skip).limit(limit).all()
    return todos

@app.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = TodoModel(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(
    todo_id: int,
    todo: TodoUpdate,  # ✅ Remove Depends()
    db: Session = Depends(get_db)
):

    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for key, value in todo.model_dump(exclude_unset=True).items():
        setattr(db_todo, key, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int = Path(..., description="The ID of the todo to delete"),
    db: Session = Depends(get_db)
):
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return