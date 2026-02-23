import { describe, it, expect } from 'vitest';
import {
    FileUtils,
    FileType,
    FileContentCategory,
    IMAGE_FILE_TYPES,
    DOCUMENT_FILE_TYPES,
    TEXT_FILE_TYPES,
    ALL_FILE_TYPES,
    FILE_TYPE_EXTENSIONS,
    getAcceptedTypesRecord,
} from '../src/FileUtils.js';

describe('FileType constants', () => {
    it('IMAGE_FILE_TYPES contains all image types', () => {
        expect(IMAGE_FILE_TYPES).toEqual([
            FileType.IMAGE_JPEG,
            FileType.IMAGE_PNG,
            FileType.IMAGE_GIF,
            FileType.IMAGE_WEBP,
        ]);
    });

    it('DOCUMENT_FILE_TYPES contains PDF', () => {
        expect(DOCUMENT_FILE_TYPES).toEqual([FileType.PDF]);
    });

    it('TEXT_FILE_TYPES contains all text types', () => {
        expect(TEXT_FILE_TYPES).toEqual([
            FileType.TEXT_PLAIN,
            FileType.TEXT_CSV,
            FileType.TEXT_HTML,
            FileType.TEXT_MARKDOWN,
        ]);
    });

    it('ALL_FILE_TYPES is the union of all groups', () => {
        expect(ALL_FILE_TYPES).toEqual([
            ...IMAGE_FILE_TYPES,
            ...DOCUMENT_FILE_TYPES,
            ...TEXT_FILE_TYPES,
        ]);
    });

    it('FILE_TYPE_EXTENSIONS maps every FileType to extensions', () => {
        for (const ft of ALL_FILE_TYPES) {
            expect(FILE_TYPE_EXTENSIONS[ft]).toBeDefined();
            expect(FILE_TYPE_EXTENSIONS[ft].length).toBeGreaterThan(0);
        }
    });

    it('JPEG has .jpg and .jpeg extensions', () => {
        expect(FILE_TYPE_EXTENSIONS[FileType.IMAGE_JPEG]).toEqual(['.jpg', '.jpeg']);
    });

    it('HTML has .html and .htm extensions', () => {
        expect(FILE_TYPE_EXTENSIONS[FileType.TEXT_HTML]).toEqual(['.html', '.htm']);
    });

    it('Markdown has .md and .markdown extensions', () => {
        expect(FILE_TYPE_EXTENSIONS[FileType.TEXT_MARKDOWN]).toEqual(['.md', '.markdown']);
    });
});

describe('getAcceptedTypesRecord', () => {
    it('returns a record mapping MIME types to extensions', () => {
        const result = getAcceptedTypesRecord([FileType.IMAGE_JPEG, FileType.PDF]);
        expect(result).toEqual({
            'image/jpeg': ['.jpg', '.jpeg'],
            'application/pdf': ['.pdf'],
        });
    });

    it('returns an empty record for empty input', () => {
        expect(getAcceptedTypesRecord([])).toEqual({});
    });

    it('handles all file types', () => {
        const result = getAcceptedTypesRecord(ALL_FILE_TYPES);
        expect(Object.keys(result)).toHaveLength(ALL_FILE_TYPES.length);
    });
});

describe('FileUtils', () => {
    describe('isImageType', () => {
        it('returns true for image MIME types', () => {
            expect(FileUtils.isImageType('image/jpeg')).toBe(true);
            expect(FileUtils.isImageType('image/png')).toBe(true);
            expect(FileUtils.isImageType('image/gif')).toBe(true);
            expect(FileUtils.isImageType('image/webp')).toBe(true);
        });

        it('returns false for non-image types', () => {
            expect(FileUtils.isImageType('application/pdf')).toBe(false);
            expect(FileUtils.isImageType('text/plain')).toBe(false);
            expect(FileUtils.isImageType('image/svg+xml')).toBe(false);
        });
    });

    describe('isDocumentType', () => {
        it('returns true for PDF', () => {
            expect(FileUtils.isDocumentType('application/pdf')).toBe(true);
        });

        it('returns false for non-document types', () => {
            expect(FileUtils.isDocumentType('image/png')).toBe(false);
            expect(FileUtils.isDocumentType('text/plain')).toBe(false);
        });
    });

    describe('isTextType', () => {
        it('returns true for text MIME types', () => {
            expect(FileUtils.isTextType('text/plain')).toBe(true);
            expect(FileUtils.isTextType('text/csv')).toBe(true);
            expect(FileUtils.isTextType('text/html')).toBe(true);
            expect(FileUtils.isTextType('text/markdown')).toBe(true);
        });

        it('returns false for non-text types', () => {
            expect(FileUtils.isTextType('image/png')).toBe(false);
            expect(FileUtils.isTextType('application/pdf')).toBe(false);
            expect(FileUtils.isTextType('text/xml')).toBe(false);
        });
    });

    describe('isSupportedType', () => {
        it('returns true for all supported types', () => {
            for (const ft of ALL_FILE_TYPES) {
                expect(FileUtils.isSupportedType(ft)).toBe(true);
            }
        });

        it('returns false for unsupported types', () => {
            expect(FileUtils.isSupportedType('application/json')).toBe(false);
            expect(FileUtils.isSupportedType('video/mp4')).toBe(false);
        });
    });

    describe('getContentCategory', () => {
        it('returns IMAGE for image types', () => {
            expect(FileUtils.getContentCategory('image/jpeg')).toBe(FileContentCategory.IMAGE);
            expect(FileUtils.getContentCategory('image/png')).toBe(FileContentCategory.IMAGE);
        });

        it('returns DOCUMENT for PDF', () => {
            expect(FileUtils.getContentCategory('application/pdf')).toBe(FileContentCategory.DOCUMENT);
        });

        it('returns TEXT for text types', () => {
            expect(FileUtils.getContentCategory('text/plain')).toBe(FileContentCategory.TEXT);
            expect(FileUtils.getContentCategory('text/csv')).toBe(FileContentCategory.TEXT);
        });

        it('returns null for unsupported types', () => {
            expect(FileUtils.getContentCategory('application/json')).toBeNull();
            expect(FileUtils.getContentCategory('video/mp4')).toBeNull();
        });
    });

    describe('decodeBase64Text', () => {
        it('decodes base64 to UTF-8 string', () => {
            const base64 = Buffer.from('Hello, World!').toString('base64');
            expect(FileUtils.decodeBase64Text(base64)).toBe('Hello, World!');
        });

        it('handles unicode characters', () => {
            const base64 = Buffer.from('Caf\u00e9 \u2615').toString('base64');
            expect(FileUtils.decodeBase64Text(base64)).toBe('Caf\u00e9 \u2615');
        });

        it('handles empty string', () => {
            const base64 = Buffer.from('').toString('base64');
            expect(FileUtils.decodeBase64Text(base64)).toBe('');
        });
    });

    describe('parseDataUrl', () => {
        it('parses an image data URL', () => {
            const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
            const result = FileUtils.parseDataUrl(dataUrl);
            expect(result).toEqual({
                category: FileContentCategory.IMAGE,
                mimeType: 'image/png',
                base64Data: 'iVBORw0KGgo=',
            });
        });

        it('parses a PDF data URL', () => {
            const dataUrl = 'data:application/pdf;base64,JVBERi0=';
            const result = FileUtils.parseDataUrl(dataUrl);
            expect(result).toEqual({
                category: FileContentCategory.DOCUMENT,
                mimeType: 'application/pdf',
                base64Data: 'JVBERi0=',
            });
        });

        it('parses a text data URL and decodes content', () => {
            const text = 'Hello, World!';
            const base64 = Buffer.from(text).toString('base64');
            const dataUrl = `data:text/plain;base64,${base64}`;
            const result = FileUtils.parseDataUrl(dataUrl);
            expect(result).toEqual({
                category: FileContentCategory.TEXT,
                mimeType: 'text/plain',
                base64Data: base64,
                textContent: text,
            });
        });

        it('returns null for non-data URLs', () => {
            expect(FileUtils.parseDataUrl('https://example.com')).toBeNull();
        });

        it('returns null when no base64 data after comma', () => {
            expect(FileUtils.parseDataUrl('data:image/png;base64')).toBeNull();
        });

        it('returns null for unsupported MIME types', () => {
            expect(FileUtils.parseDataUrl('data:application/json;base64,e30=')).toBeNull();
        });

        it('returns null for malformed data URL with no MIME type', () => {
            expect(FileUtils.parseDataUrl('data:;base64,abc')).toBeNull();
        });
    });

    describe('getSupportedTypes', () => {
        it('returns all supported MIME type strings', () => {
            const types = FileUtils.getSupportedTypes();
            expect(types).toEqual(ALL_FILE_TYPES.map(String));
        });

        it('returns a new array each time', () => {
            const a = FileUtils.getSupportedTypes();
            const b = FileUtils.getSupportedTypes();
            expect(a).not.toBe(b);
            expect(a).toEqual(b);
        });
    });

    describe('getUnsupportedTypeError', () => {
        it('includes the unsupported MIME type', () => {
            const error = FileUtils.getUnsupportedTypeError('video/mp4');
            expect(error).toContain('video/mp4');
        });

        it('includes the list of supported types', () => {
            const error = FileUtils.getUnsupportedTypeError('video/mp4');
            expect(error).toContain('image/jpeg');
            expect(error).toContain('application/pdf');
            expect(error).toContain('text/plain');
        });
    });

    describe('getFileTypeLabel', () => {
        it('returns known labels for supported types', () => {
            expect(FileUtils.getFileTypeLabel('application/pdf')).toBe('PDF');
            expect(FileUtils.getFileTypeLabel('image/jpeg')).toBe('JPEG');
            expect(FileUtils.getFileTypeLabel('image/png')).toBe('PNG');
            expect(FileUtils.getFileTypeLabel('image/webp')).toBe('WebP');
            expect(FileUtils.getFileTypeLabel('image/gif')).toBe('GIF');
            expect(FileUtils.getFileTypeLabel('text/plain')).toBe('TXT');
            expect(FileUtils.getFileTypeLabel('text/csv')).toBe('CSV');
            expect(FileUtils.getFileTypeLabel('text/html')).toBe('HTML');
            expect(FileUtils.getFileTypeLabel('text/markdown')).toBe('Markdown');
        });

        it('falls back to uppercase subtype for unknown MIME types', () => {
            expect(FileUtils.getFileTypeLabel('application/json')).toBe('JSON');
            expect(FileUtils.getFileTypeLabel('video/mp4')).toBe('MP4');
        });

        it('returns FILE when no subtype is extractable', () => {
            expect(FileUtils.getFileTypeLabel('')).toBe('FILE');
        });
    });
});
