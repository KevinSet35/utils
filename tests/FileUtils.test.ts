import { describe, it, expect } from 'vitest';
import {
    FileUtils,
    FileType,
    FileContentCategory,
    MediaCategory,
    IMAGE_FILE_TYPES,
    DOCUMENT_FILE_TYPES,
    TEXT_FILE_TYPES,
    ALL_FILE_TYPES,
    VIDEO_FILE_TYPES,
    AUDIO_FILE_TYPES,
    ALL_MEDIA_FILE_TYPES,
    FILE_TYPE_EXTENSIONS,
    EXTENSION_TO_MIME,
    MIME_TO_EXTENSION,
    EXTENSION_TO_SUBDIRECTORY,
    getAcceptedTypesRecord,
} from '../src/FileUtils.js';

// ============================================================================
// Existing tests (backwards compatibility)
// ============================================================================

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
            const base64 = Buffer.from('Café ☕').toString('base64');
            expect(FileUtils.decodeBase64Text(base64)).toBe('Café ☕');
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

// ============================================================================
// New tests (v1.1+ additions)
// ============================================================================

describe('New FileType enum values', () => {
    it('includes video types', () => {
        expect(FileType.VIDEO_MP4).toBe('video/mp4');
        expect(FileType.VIDEO_WEBM).toBe('video/webm');
    });

    it('includes audio types', () => {
        expect(FileType.AUDIO_MPEG).toBe('audio/mpeg');
        expect(FileType.AUDIO_WAV).toBe('audio/wav');
    });
});

describe('New file type groups', () => {
    it('VIDEO_FILE_TYPES contains video types', () => {
        expect(VIDEO_FILE_TYPES).toEqual([FileType.VIDEO_MP4, FileType.VIDEO_WEBM]);
    });

    it('AUDIO_FILE_TYPES contains audio types', () => {
        expect(AUDIO_FILE_TYPES).toEqual([FileType.AUDIO_MPEG, FileType.AUDIO_WAV]);
    });

    it('ALL_MEDIA_FILE_TYPES is the superset of all types', () => {
        expect(ALL_MEDIA_FILE_TYPES).toEqual([
            ...IMAGE_FILE_TYPES,
            ...VIDEO_FILE_TYPES,
            ...AUDIO_FILE_TYPES,
            ...DOCUMENT_FILE_TYPES,
            ...TEXT_FILE_TYPES,
        ]);
    });

    it('FILE_TYPE_EXTENSIONS includes video and audio types', () => {
        expect(FILE_TYPE_EXTENSIONS[FileType.VIDEO_MP4]).toEqual(['.mp4']);
        expect(FILE_TYPE_EXTENSIONS[FileType.VIDEO_WEBM]).toEqual(['.webm']);
        expect(FILE_TYPE_EXTENSIONS[FileType.AUDIO_MPEG]).toEqual(['.mp3']);
        expect(FILE_TYPE_EXTENSIONS[FileType.AUDIO_WAV]).toEqual(['.wav']);
    });
});

describe('MediaCategory enum', () => {
    it('has all expected values', () => {
        expect(MediaCategory.IMAGE).toBe('image');
        expect(MediaCategory.VIDEO).toBe('video');
        expect(MediaCategory.AUDIO).toBe('audio');
        expect(MediaCategory.DOCUMENT).toBe('document');
        expect(MediaCategory.TEXT).toBe('text');
    });
});

describe('EXTENSION_TO_MIME', () => {
    it('maps common extensions to MIME types', () => {
        expect(EXTENSION_TO_MIME['.png']).toBe('image/png');
        expect(EXTENSION_TO_MIME['.jpg']).toBe('image/jpeg');
        expect(EXTENSION_TO_MIME['.jpeg']).toBe('image/jpeg');
        expect(EXTENSION_TO_MIME['.mp4']).toBe('video/mp4');
        expect(EXTENSION_TO_MIME['.mp3']).toBe('audio/mpeg');
        expect(EXTENSION_TO_MIME['.wav']).toBe('audio/wav');
        expect(EXTENSION_TO_MIME['.webm']).toBe('video/webm');
    });
});

describe('MIME_TO_EXTENSION', () => {
    it('maps MIME types to canonical extensions', () => {
        expect(MIME_TO_EXTENSION['image/jpeg']).toBe('.jpg');
        expect(MIME_TO_EXTENSION['video/mp4']).toBe('.mp4');
        expect(MIME_TO_EXTENSION['audio/mpeg']).toBe('.mp3');
    });
});

describe('EXTENSION_TO_SUBDIRECTORY', () => {
    it('maps image extensions to images', () => {
        expect(EXTENSION_TO_SUBDIRECTORY['.png']).toBe('images');
        expect(EXTENSION_TO_SUBDIRECTORY['.jpg']).toBe('images');
        expect(EXTENSION_TO_SUBDIRECTORY['.webp']).toBe('images');
    });

    it('maps video extensions to videos', () => {
        expect(EXTENSION_TO_SUBDIRECTORY['.mp4']).toBe('videos');
        expect(EXTENSION_TO_SUBDIRECTORY['.webm']).toBe('videos');
    });

    it('maps audio extensions to audio', () => {
        expect(EXTENSION_TO_SUBDIRECTORY['.mp3']).toBe('audio');
        expect(EXTENSION_TO_SUBDIRECTORY['.wav']).toBe('audio');
    });
});

describe('FileUtils - new video/audio methods', () => {
    describe('isVideoType', () => {
        it('returns true for video MIME types', () => {
            expect(FileUtils.isVideoType('video/mp4')).toBe(true);
            expect(FileUtils.isVideoType('video/webm')).toBe(true);
        });

        it('returns false for non-video types', () => {
            expect(FileUtils.isVideoType('image/png')).toBe(false);
            expect(FileUtils.isVideoType('audio/mpeg')).toBe(false);
        });
    });

    describe('isAudioType', () => {
        it('returns true for audio MIME types', () => {
            expect(FileUtils.isAudioType('audio/mpeg')).toBe(true);
            expect(FileUtils.isAudioType('audio/wav')).toBe(true);
        });

        it('returns false for non-audio types', () => {
            expect(FileUtils.isAudioType('video/mp4')).toBe(false);
            expect(FileUtils.isAudioType('image/png')).toBe(false);
        });
    });

    describe('isKnownMediaType', () => {
        it('returns true for all known media types', () => {
            for (const ft of ALL_MEDIA_FILE_TYPES) {
                expect(FileUtils.isKnownMediaType(ft)).toBe(true);
            }
        });

        it('returns false for unknown types', () => {
            expect(FileUtils.isKnownMediaType('application/json')).toBe(false);
        });
    });

    describe('getMediaCategory', () => {
        it('returns correct category for each type', () => {
            expect(FileUtils.getMediaCategory('image/png')).toBe(MediaCategory.IMAGE);
            expect(FileUtils.getMediaCategory('video/mp4')).toBe(MediaCategory.VIDEO);
            expect(FileUtils.getMediaCategory('audio/mpeg')).toBe(MediaCategory.AUDIO);
            expect(FileUtils.getMediaCategory('application/pdf')).toBe(MediaCategory.DOCUMENT);
            expect(FileUtils.getMediaCategory('text/plain')).toBe(MediaCategory.TEXT);
        });

        it('returns null for unknown types', () => {
            expect(FileUtils.getMediaCategory('application/json')).toBeNull();
        });
    });
});

describe('FileUtils - MIME/extension helpers', () => {
    describe('getMimeTypeFromExtension', () => {
        it('returns correct MIME type for known extensions', () => {
            expect(FileUtils.getMimeTypeFromExtension('.png')).toBe('image/png');
            expect(FileUtils.getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
            expect(FileUtils.getMimeTypeFromExtension('.mp4')).toBe('video/mp4');
            expect(FileUtils.getMimeTypeFromExtension('.mp3')).toBe('audio/mpeg');
            expect(FileUtils.getMimeTypeFromExtension('.wav')).toBe('audio/wav');
        });

        it('is case-insensitive', () => {
            expect(FileUtils.getMimeTypeFromExtension('.PNG')).toBe('image/png');
            expect(FileUtils.getMimeTypeFromExtension('.MP4')).toBe('video/mp4');
        });

        it('returns application/octet-stream for unknown extensions', () => {
            expect(FileUtils.getMimeTypeFromExtension('.xyz')).toBe('application/octet-stream');
            expect(FileUtils.getMimeTypeFromExtension('.bin')).toBe('application/octet-stream');
        });
    });

    describe('getMimeTypeFromPath', () => {
        it('extracts extension from path and returns MIME type', () => {
            expect(FileUtils.getMimeTypeFromPath('/path/to/file.png')).toBe('image/png');
            expect(FileUtils.getMimeTypeFromPath('/some/video.mp4')).toBe('video/mp4');
            expect(FileUtils.getMimeTypeFromPath('audio.wav')).toBe('audio/wav');
        });

        it('returns application/octet-stream for no extension', () => {
            expect(FileUtils.getMimeTypeFromPath('/path/to/file')).toBe('application/octet-stream');
        });
    });

    describe('getExtensionFromMimeType', () => {
        it('returns canonical extension for known MIME types', () => {
            expect(FileUtils.getExtensionFromMimeType('image/jpeg')).toBe('.jpg');
            expect(FileUtils.getExtensionFromMimeType('video/mp4')).toBe('.mp4');
            expect(FileUtils.getExtensionFromMimeType('audio/mpeg')).toBe('.mp3');
        });

        it('returns null for unknown MIME types', () => {
            expect(FileUtils.getExtensionFromMimeType('application/json')).toBeNull();
        });
    });

    describe('getStorageSubdirectory', () => {
        it('maps image extensions to images', () => {
            expect(FileUtils.getStorageSubdirectory('.png')).toBe('images');
            expect(FileUtils.getStorageSubdirectory('.jpg')).toBe('images');
            expect(FileUtils.getStorageSubdirectory('.webp')).toBe('images');
        });

        it('maps video extensions to videos', () => {
            expect(FileUtils.getStorageSubdirectory('.mp4')).toBe('videos');
            expect(FileUtils.getStorageSubdirectory('.webm')).toBe('videos');
        });

        it('maps audio extensions to audio', () => {
            expect(FileUtils.getStorageSubdirectory('.mp3')).toBe('audio');
            expect(FileUtils.getStorageSubdirectory('.wav')).toBe('audio');
        });

        it('returns files for unknown extensions', () => {
            expect(FileUtils.getStorageSubdirectory('.xyz')).toBe('files');
        });

        it('is case-insensitive', () => {
            expect(FileUtils.getStorageSubdirectory('.PNG')).toBe('images');
        });
    });

    describe('getStorageSubdirectoryFromPath', () => {
        it('returns correct subdirectory from file path', () => {
            expect(FileUtils.getStorageSubdirectoryFromPath('/path/to/photo.png')).toBe('images');
            expect(FileUtils.getStorageSubdirectoryFromPath('/path/to/clip.mp4')).toBe('videos');
            expect(FileUtils.getStorageSubdirectoryFromPath('/path/to/voice.mp3')).toBe('audio');
        });

        it('returns files for paths without extension', () => {
            expect(FileUtils.getStorageSubdirectoryFromPath('/path/to/file')).toBe('files');
        });
    });
});

describe('FileUtils - path helpers', () => {
    describe('extractExtension', () => {
        it('extracts extension with dot', () => {
            expect(FileUtils.extractExtension('file.png')).toBe('.png');
            expect(FileUtils.extractExtension('/path/to/video.mp4')).toBe('.mp4');
        });

        it('lowercases the extension', () => {
            expect(FileUtils.extractExtension('FILE.PNG')).toBe('.png');
        });

        it('returns null for no extension', () => {
            expect(FileUtils.extractExtension('noext')).toBeNull();
            expect(FileUtils.extractExtension('/path/to/file')).toBeNull();
        });

        it('returns null for dot at end', () => {
            expect(FileUtils.extractExtension('file.')).toBeNull();
        });
    });

    describe('extractFilename', () => {
        it('extracts filename from path with forward slashes', () => {
            expect(FileUtils.extractFilename('/path/to/file.png')).toBe('file.png');
        });

        it('extracts filename from path with backslashes', () => {
            expect(FileUtils.extractFilename('C:\\Users\\test\\file.png')).toBe('file.png');
        });

        it('returns the string itself if no slashes', () => {
            expect(FileUtils.extractFilename('file.png')).toBe('file.png');
        });
    });

    describe('toOutputUrl', () => {
        it('converts absolute path to output URL', () => {
            expect(FileUtils.toOutputUrl(
                '/Users/app/outputs/images/photo.png',
                '/Users/app/outputs',
            )).toBe('/outputs/images/photo.png');
        });

        it('handles trailing slash in outputDir', () => {
            expect(FileUtils.toOutputUrl(
                '/app/outputs/videos/clip.mp4',
                '/app/outputs/',
            )).toBe('/outputs/videos/clip.mp4');
        });

        it('falls back to just filename if path is not under outputDir', () => {
            expect(FileUtils.toOutputUrl(
                '/other/path/file.png',
                '/app/outputs',
            )).toBe('/outputs/file.png');
        });
    });

    describe('fromOutputUrl', () => {
        it('converts output URL to absolute path', () => {
            expect(FileUtils.fromOutputUrl(
                '/outputs/images/photo.png',
                '/Users/app/outputs',
            )).toBe('/Users/app/outputs/images/photo.png');
        });

        it('handles trailing slash in outputDir', () => {
            expect(FileUtils.fromOutputUrl(
                '/outputs/videos/clip.mp4',
                '/app/outputs/',
            )).toBe('/app/outputs/videos/clip.mp4');
        });
    });

    describe('buildStorageKey', () => {
        it('builds key with correct subdirectory', () => {
            expect(FileUtils.buildStorageKey('/path/to/image.png')).toBe('images/image.png');
            expect(FileUtils.buildStorageKey('/path/to/video.mp4')).toBe('videos/video.mp4');
            expect(FileUtils.buildStorageKey('/path/to/audio.mp3')).toBe('audio/audio.mp3');
            expect(FileUtils.buildStorageKey('/path/to/data.bin')).toBe('files/data.bin');
        });
    });

    describe('buildGenerationKey', () => {
        it('builds namespaced key', () => {
            expect(FileUtils.buildGenerationKey('run-123', 'source_image', 'photo.png'))
                .toBe('generations/run-123/source_image/photo.png');
        });
    });

    describe('buildOutputPath', () => {
        it('builds full output path', () => {
            expect(FileUtils.buildOutputPath('/app/outputs', 'images', 'abc.png'))
                .toBe('/app/outputs/images/abc.png');
        });

        it('handles trailing slash in outputDir', () => {
            expect(FileUtils.buildOutputPath('/app/outputs/', 'videos', 'clip.mp4'))
                .toBe('/app/outputs/videos/clip.mp4');
        });
    });
});

describe('FileUtils - labels for new types', () => {
    it('returns labels for video and audio types', () => {
        expect(FileUtils.getFileTypeLabel('video/mp4')).toBe('MP4');
        expect(FileUtils.getFileTypeLabel('video/webm')).toBe('WebM');
        expect(FileUtils.getFileTypeLabel('audio/mpeg')).toBe('MP3');
        expect(FileUtils.getFileTypeLabel('audio/wav')).toBe('WAV');
    });
});
