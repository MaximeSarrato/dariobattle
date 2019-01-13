import React from 'react';
import { DiscussionListItem } from '..';

interface IProps {
  items: string[];
}

const DiscussionList: React.FunctionComponent<IProps> = ({ items }) => (
  <div className="discussion">
    {items.map((item) => (
      <DiscussionListItem key={item} destName={item} />
    ))}
  </div>
);

export default DiscussionList;
