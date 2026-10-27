import { Injectable } from '@nestjs/common';
import { render } from '@react-email/components';
import * as React from 'react';

import NewArticle, { NewArticleProps } from './templates/new-article';

@Injectable()
export class TemplatesService {
  async renderNewArticle(props: NewArticleProps): Promise<string> {
    return render(<NewArticle {...props} />);
  }
}
