import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const RadarChart = ({ data, dataKey = "value", color = "#8884d8" }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar
          name="Stats"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;
