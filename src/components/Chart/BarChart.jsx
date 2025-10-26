import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "", month: 2400 },
  { name: "", month: 1398 },
  { name: "", month: 9800 },
  { name: "", month: 6908 },
  { name: "", month: 4800 },
  { name: "", month: 7800 },
  { name: "", month: 4200 },
  { name: "", month: 3900 },
  { name: "", month: 8760 },
  { name: "", month: 6800 },
  { name: "", month: 8300 },
  { name: "", month: 7200 },
];

const CustomBar = (props) => {
  const { fill, ...rest } = props;
  return (
    <g>
      <rect fill="#eee" {...rest} />
      <rect fill={fill} {...rest} />
    </g>
  );
};

const BarChartExample = () => {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="" />
        <XAxis dataKey="name" />
        <YAxis label={null} tick={null} />
        <Tooltip />
        {/* <Legend /> */}
        <Bar dataKey="month" fill="rgb(97, 51, 51)" shape={<CustomBar />} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartExample;
