export interface ResponseNode {
  responseNodes: Array<{
    responseId: string;
    sender: string;
    parentResponseId?: string;
  }>;
  inflightResponses: Array<unknown>;
}

export interface LoadResponses {
  responses: Array<{
    responseId: string;
    message: string;
    sender: string;
    createTime: string;
    manual: boolean;
    partial: boolean;
    shared: boolean;
    query: string;
    queryType: string;
    webSearchResults: Array<{
      url: string;
      title: string;
      preview: string;
      searchEngineText: string;
      description: string;
      siteName: string;
      metadataTitle: string;
      creator: string;
      image: string;
      favicon: string;
      citationId: string;
    }>;
    xpostIds: Array<unknown>;
    xposts: Array<unknown>;
    generatedImageUrls: Array<unknown>;
    imageAttachments: Array<unknown>;
    fileAttachments: Array<unknown>;
    cardAttachmentsJson: Array<unknown>;
    fileUris: Array<unknown>;
    fileAttachmentsMetadata: Array<unknown>;
    isControl: boolean;
    steps: Array<{
      text: Array<string>;
      tags: Array<string>;
      webSearchResults: Array<{
        url: string;
        title: string;
        preview: string;
        searchEngineText: string;
        description: string;
        siteName: string;
        metadataTitle: string;
        creator: string;
        image: string;
        favicon: string;
        citationId: string;
      }>;
      xpostIds: Array<unknown>;
      xposts: Array<unknown>;
    }>;
    mediaTypes: Array<unknown>;
    webpageUrls: Array<unknown>;
    parentResponseId?: string;
    error?: string;
  }>;
}
