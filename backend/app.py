from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
CORS(app)

# Set up SQLite database
engine = create_engine('sqlite:///todos.db')
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

class Todo(Base):
    __tablename__ = 'todos'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    completed = Column(Boolean, default=False)

# Create the table if it doesn't exist
Base.metadata.create_all(engine)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = session.query(Todo).all()
    return jsonify([{'id': todo.id, 'title': todo.title, 'completed': todo.completed} for todo in todos])

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    new_todo = Todo(title=data['title'])
    session.add(new_todo)
    session.commit()
    return jsonify({'id': new_todo.id, 'title': new_todo.title, 'completed': new_todo.completed}), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    todo = session.query(Todo).get(todo_id)
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404

    todo.title = data.get('title', todo.title)
    todo.completed = data.get('completed', todo.completed)
    session.commit()
    return jsonify({'id': todo.id, 'title': todo.title, 'completed': todo.completed})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = session.query(Todo).get(todo_id)
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404

    session.delete(todo)
    session.commit()
    return '', 204

if __name__ == '__main__':
    import os
    # Use the specified port or default to 5000
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)