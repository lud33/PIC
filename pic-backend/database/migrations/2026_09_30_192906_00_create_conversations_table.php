<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pic_post_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->unique('pic_post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
