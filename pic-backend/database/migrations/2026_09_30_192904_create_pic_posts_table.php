<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pic_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('event_name');
            $table->text('description');
            $table->string('location');
            $table->date('event_date');
            $table->time('event_time');
            $table->unsignedTinyInteger('people_needed')->default(1);
            $table->enum('status', ['active', 'full', 'deactivated', 'passed'])->default('active');
            $table->string('category')->nullable();
            $table->string('cover_image')->nullable();
            $table->timestamps();

            // Indexes for Discover query
            $table->index(['status', 'event_date']);
            $table->index('user_id');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pic_posts');
    }
};
