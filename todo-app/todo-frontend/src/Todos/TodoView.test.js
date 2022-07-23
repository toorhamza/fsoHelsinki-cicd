import { render } from '@testing-library/react';
import TodoList from "./List"

test('during build phase', () => {
    const myMockDelete = jest.fn()
    const myMockComplete = jest.fn()
    const todos = [{ _id: "testid", text: "this is a test", done: false, __v: 0 }]
    const { getByText } = render(<TodoList todos={todos} deleteTodo={myMockDelete} completeTodo={myMockComplete} />);
    expect(getByText('this is a test')).toBeInTheDocument()
    expect(getByText('Delete')).toBeInTheDocument()
    expect(getByText('Set as done')).toBeInTheDocument()

})