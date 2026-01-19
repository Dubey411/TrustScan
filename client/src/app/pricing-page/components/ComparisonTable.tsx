import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    free: boolean | string;
    student: boolean | string;
    premium: boolean | string;
  }[];
}

interface ComparisonTableProps {
  data: ComparisonFeature[];
}

const ComparisonTable = ({ data }: ComparisonTableProps) => {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icon name="CheckIcon" size={20} variant="solid" className="text-success-green mx-auto" />
      ) : (
        <Icon name="XMarkIcon" size={20} variant="solid" className="text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm text-foreground">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-4 font-headline font-semibold text-foreground">
              Features
            </th>
            <th className="text-center p-4 font-headline font-semibold text-foreground">
              Free
            </th>
            <th className="text-center p-4 font-headline font-semibold text-primary">
              Student
            </th>
            <th className="text-center p-4 font-headline font-semibold text-foreground">
              Premium
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((category, categoryIndex) => (
            <React.Fragment key={categoryIndex}>
              <tr className="bg-background">
                <td
                  colSpan={4}
                  className="p-4 font-headline font-bold text-foreground text-sm"
                >
                  {category.category}
                </td>
              </tr>
              {category.features.map((feature, featureIndex) => (
                <tr
                  key={featureIndex}
                  className="border-b border-border hover:bg-muted/50 transition-colors duration-200"
                >
                  <td className="p-4 text-sm text-foreground">{feature.name}</td>
                  <td className="p-4 text-center">{renderCell(feature.free)}</td>
                  <td className="p-4 text-center bg-primary/5">
                    {renderCell(feature.student)}
                  </td>
                  <td className="p-4 text-center">{renderCell(feature.premium)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;