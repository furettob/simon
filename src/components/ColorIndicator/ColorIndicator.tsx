import { COLORS } from "@/utils/simonReducer";
import classNames from "classnames";

export const ColorIndicator = ({
  colorIndex,
  isHighlighted,
}: {
  colorIndex: number;
  isHighlighted?: boolean;
}) => {
  return (
    <div className="colorIndicatorWrapper">
      <div className={classNames("colorIndicator", { active: isHighlighted }, `bgColor--${COLORS[colorIndex].toLowerCase()}`)}>
        <div>{COLORS[colorIndex].substring(0,1).toUpperCase()}</div>
      </div>
      {isHighlighted && <div className="colorIndicatorHighlighted"/>}
    </div>
  );
};
