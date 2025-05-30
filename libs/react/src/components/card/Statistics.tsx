import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface StatisticsCardProps {
  label: string;
  value: number;
  diff: number;
  diffPercent: number;
}

export function StatisticsCard({ label, value, diff, diffPercent }: StatisticsCardProps) {
  const theme = useTheme();
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <Grid component="div" key={label}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} mb={1}>
            {label.includes('Retention') ? `${value.toFixed(1)}%` : value.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isUp && <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />}
            {isDown && <ArrowDropDownIcon sx={{ color: theme.palette.error.main }} />}
            <Typography
              variant="body2"
              sx={{
                color: isUp ? theme.palette.success.main : isDown ? theme.palette.error.main : 'text.secondary',
                fontWeight: 600,
              }}
            >
              {diff > 0 ? '+' : ''}
              {diff} ({diffPercent > 0 ? '+' : ''}
              {diffPercent.toFixed(2)}%)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
