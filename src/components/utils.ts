const colors = [
  '#FFC300', // Yellow
  '#DAF7A6', // Light Green
  '#FF5733', // Orange
  '#C70039', // Red
  '#900C3F', // Maroon
  '#581845', // Purple
  '#2980B9', // Blue
  '#27AE60', // Green
  '#8E44AD', // Violet
  '#F1C40F', // Dark Yellow
];

export const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};