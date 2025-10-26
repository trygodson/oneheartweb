import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AreaCharts = ({ height, data = [] }) => {
  const transformedData = data
    ?.map((item) => ({
      name: months[item.month - 1],
      sales: item.totalSales,
      expenses: item.totalExpense,
    }))
    .reverse();

    console.log(transformedData);

  return (
    <ResponsiveContainer className={'-ml-7'} width="102%" height={height || 300}>
      <AreaChart data={transformedData ?? []}>
        <XAxis dataKey="name" fontSize={'10px'} axisLine={{ display: 'none' }} />
        <YAxis
          label={null}
          interval={1}
          fontSize={'10px'}
          axisLine={{ display: 'none' }}
          // display={"none"}
        />
        <Tooltip />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="20%" stopColor="rgba(67, 1, 12,.09)" />
            <stop offset="20%" stopColor="#f7f7f7" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
            {/* <stop offset="10%" stopColor="rgba(245, 118, 0,.01)" /> */}
            <stop offset="10%" stopColor="rgb(237, 218, 199)" />
            <stop offset="30%" stopColor="#fff" />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="sales"
          stroke="rgb(67, 1, 12)"
          fill="url(#gradient)"
          strokeWidth={'1px'}
          fillOpacity={'.3'}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="rgb(245, 118, 0)"
          strokeWidth={'1px'}
          fill="url(#gradient2)"
          stopColor="white"
          fillOpacity={'.4'}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaCharts;
