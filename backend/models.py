from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Auth.js uses string UUIDs usually
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    image = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    handles = relationship("LinkedHandles", back_populates="user", uselist=False, cascade="all, delete")
    preferences = relationship("Preferences", back_populates="user", uselist=False, cascade="all, delete")
    notebook_entries = relationship("NotebookEntry", back_populates="user", cascade="all, delete")

class LinkedHandles(Base):
    __tablename__ = "linked_handles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    codeforces = Column(String, nullable=True)
    codechef = Column(String, nullable=True)
    cses = Column(String, nullable=True)
    leetcode = Column(String, nullable=True)
    
    last_synced = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="handles")

class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    default_language = Column(String, default="cpp")
    
    cpp_template = Column(Text, nullable=True)
    java_template = Column(Text, nullable=True)
    python_template = Column(Text, nullable=True)

    user = relationship("User", back_populates="preferences")

class NotebookEntry(Base):
    __tablename__ = "notebook_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Markdown content
    
    platform = Column(String, nullable=True) # E.g., 'Codeforces', 'LeetCode'
    problem_url = Column(String, nullable=True)
    
    tags = Column(JSON, nullable=True) # List of tags
    difficulty = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="notebook_entries")

class WorkspaceDraft(Base):
    __tablename__ = "workspace_drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    platform = Column(String, nullable=False)
    problem_id = Column(String, nullable=False)
    language = Column(String, nullable=False)
    code = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False) # Important for conflict resolution

class WorkspaceLayout(Base):
    __tablename__ = "workspace_layouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    platform = Column(String, nullable=False)
    problem_id = Column(String, nullable=False)
    drawer_height = Column(Integer, nullable=False, default=300)
    active_tab = Column(String, nullable=False, default="testcases")
    active_language = Column(String, nullable=False, default="cpp")
    updated_at = Column(DateTime(timezone=True), nullable=False)

